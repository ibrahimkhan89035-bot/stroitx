import { Request, Response } from 'express';
import { prisma } from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for KYC document uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'kyc');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueName = `kyc_${Date.now()}_${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk || mimeOk);
  },
}).single('kycDoc');

export const getVerificationStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
      include: { verificationDocs: { orderBy: { createdAt: 'desc' } } },
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional profile not found.' });
    }

    // Determine overall status from documents
    let verificationStatus = 'NOT_SUBMITTED';
    if (professional.verificationDocs.length > 0) {
      const hasVerified = professional.verificationDocs.some(d => d.status === 'VERIFIED');
      const hasPending = professional.verificationDocs.some(d => d.status === 'PENDING');
      if (hasVerified) verificationStatus = 'VERIFIED';
      else if (hasPending) verificationStatus = 'PENDING';
      else verificationStatus = 'REJECTED';
    }

    // Map documents to expose secure authenticated endpoint URLs
    const formattedDocs = professional.verificationDocs.map(d => ({
      ...d,
      documentUrl: `/api/verification/document/${d.id}`,
    }));

    return res.status(200).json({
      success: true,
      message: 'Verification status retrieved.',
      data: {
        verificationStatus,
        verified: professional.verified,
        verifications: formattedDocs,
      },
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching verification status.' });
  }
};

export const uploadVerificationDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional profile not found.' });
    }

    const { documentType, documentNumber } = req.body;
    const file = (req as any).file;

    let documentUrl: string | null = null;
    if (file) {
      documentUrl = `/uploads/kyc/${file.filename}`;
    }

    const doc = await prisma.verificationDocument.create({
      data: {
        professionalId: professional.id,
        documentType: documentType || 'IDENTITY_PROOF',
        documentNumber: documentNumber || '',
        documentUrl,
        status: 'PENDING',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Verification document uploaded successfully. Admin will review your KYC.',
      data: {
        ...doc,
        documentUrl: `/api/verification/document/${doc.id}`,
      },
    });
  } catch (error) {
    console.error('Verification upload error:', error);
    return res.status(500).json({ success: false, message: 'Server error uploading verification document.' });
  }
};

export const adminReviewDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const normalizedStatus = status === 'VERIFIED' ? 'VERIFIED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING';

    // 1. Check if ID matches a VerificationDocument
    const doc = await prisma.verificationDocument.findUnique({ where: { id } });
    if (doc) {
      const updatedDoc = await prisma.verificationDocument.update({
        where: { id },
        data: {
          status: normalizedStatus,
          adminNotes: adminNotes || undefined,
        },
      });

      if (normalizedStatus === 'VERIFIED') {
        await prisma.professionalProfile.update({
          where: { id: doc.professionalId },
          data: { verified: true },
        });
      }

      return res.status(200).json({
        success: true,
        message: `Verification document status updated to ${normalizedStatus}.`,
        data: {
          ...updatedDoc,
          documentUrl: `/api/verification/document/${updatedDoc.id}`,
        },
      });
    }

    // 2. Check if ID matches a ProfessionalProfile directly
    const profile = await prisma.professionalProfile.findUnique({ where: { id } });
    if (profile) {
      const updatedProfile = await prisma.professionalProfile.update({
        where: { id },
        data: { verified: normalizedStatus === 'VERIFIED' },
      });

      // Also update pending verification documents for this professional
      await prisma.verificationDocument.updateMany({
        where: { professionalId: id },
        data: {
          status: normalizedStatus,
          adminNotes: adminNotes || undefined,
        },
      });

      return res.status(200).json({
        success: true,
        message: `Professional verification status updated to ${normalizedStatus}.`,
        data: updatedProfile,
      });
    }

    return res.status(404).json({ success: false, message: 'Verification record not found.' });
  } catch (error) {
    console.error('Admin review error:', error);
    return res.status(500).json({ success: false, message: 'Server error reviewing verification.' });
  }
};

/**
 * Securely stream / download an uploaded KYC verification document.
 * Access Control: Document owner (professional) or Admin/Founder ONLY.
 */
export const getVerificationDocumentFile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Document identifier is required.' });
    }

    // 1. Locate VerificationDocument by cuid or by contained filename
    let doc = await prisma.verificationDocument.findUnique({
      where: { id },
      include: {
        professional: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!doc) {
      doc = await prisma.verificationDocument.findFirst({
        where: {
          documentUrl: { contains: id },
        },
        include: {
          professional: {
            select: { id: true, userId: true },
          },
        },
      });
    }

    if (!doc || !doc.documentUrl) {
      return res.status(404).json({ success: false, message: 'Verification document record not found.' });
    }

    // 2. Authorization Check: Must be document owner (professional) OR Admin/Founder
    const isOwner = doc.professional.userId === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'FOUNDER';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to view or download this verification document.',
      });
    }

    // 3. Resolve file safely on disk
    const rawFilename = path.basename(doc.documentUrl);
    const sanitizedFilename = path.basename(rawFilename); // Prevent directory traversal
    const filePath = path.join(process.cwd(), 'uploads', 'kyc', sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on disk.' });
    }

    // 4. Set Content-Type and security headers
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 5. Send file
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving verification document:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving verification document.' });
  }
};

