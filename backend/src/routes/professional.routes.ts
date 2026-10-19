import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { portfolioUploadMiddleware, storageService } from '../integrations/storage.service';

const router = Router();

// 1. Fetch current logged-in professional's profile
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; 
    if (!userId) return res.status(401).json({ message: 'Unauthorized. Please log in.' });

    let professional = await prisma.professionalProfile.findUnique({
      where: { userId },
      include: { 
        user: {
          include: {
            reviewsReceived: { include: { reviewer: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
          }
        },
        pastProjects: true // This will now work perfectly!
      }
    });

    if (!professional) {
      professional = await prisma.professionalProfile.create({
        data: { userId, profession: 'General Contractor' },
        include: { 
          user: {
            include: {
              reviewsReceived: { include: { reviewer: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
            }
          },
          pastProjects: true
        }
      });
    }
    res.status(200).json({ data: professional });
  } catch (error) {
    console.error('Error fetching /me:', error);
    res.status(500).json({ message: 'Failed to fetch your profile' });
  }
});

// 2. UPDATE current logged-in professional's profile
router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; 
    const { companyName, businessName, profession, location, bio, rating, reviewCount } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updatedProfile = await prisma.professionalProfile.update({
      where: { userId },
      data: {
        businessName: businessName || companyName,
        profession,
        location,
        bio,
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(reviewCount !== undefined && { reviewCount: Number(reviewCount) })
      }
    });

    res.status(200).json({ message: 'Profile updated successfully', data: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// 3. Fetch all professionals
router.get('/', async (req: Request, res: Response) => {
  try {
    const professionals = await prisma.professionalProfile.findMany({
      include: { user: { select: { name: true, email: true, phone: true, role: true, isActive: true } } }
    });
    res.status(200).json({ data: professionals });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).json({ message: 'Failed to fetch professionals' });
  }
});

// 3.5 Fetch current logged-in professional's portfolio projects
router.get('/portfolio', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
      include: { pastProjects: { orderBy: { createdAt: 'desc' } } }
    });

    if (!professional) return res.status(404).json({ message: 'Professional profile not found' });
    res.status(200).json({ success: true, data: professional.pastProjects });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

// 4. Fetch a single professional by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const professional = await prisma.professionalProfile.findUnique({
      where: { id },
      include: {
        user: { 
          select: { 
            name: true, email: true, phone: true, role: true, isActive: true,
            reviewsReceived: { include: { reviewer: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
          } 
        },
        pastProjects: true // Homeowners will now see the images!
      }
    });

    if (!professional) return res.status(404).json({ message: 'Professional not found' });
    res.status(200).json({ data: professional });
  } catch (error) {
    console.error('Error fetching professional:', error);
    res.status(500).json({ message: 'Failed to fetch professional details' });
  }
});

// 5. Submit a review for a professional
router.post('/:id/reviews', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const reviewerId = (req as any).user?.id; 

    if (!reviewerId) {
      return res.status(401).json({ message: 'You must be logged in to leave a review' });
    }

    const professional = await prisma.professionalProfile.findUnique({ where: { id } });
    if (!professional) return res.status(404).json({ message: 'Professional not found' });

    try {
      await prisma.review.create({
        data: {
          rating: Number(rating),
          comment: comment,
          reviewerId: reviewerId,
          professionalId: professional.userId,
          projectId: "DIRECT_PROFILE_REVIEW"
        }
      });
    } catch (dbError: any) {
       if (dbError.code === 'P2003' && dbError.meta?.field_name?.includes('projectId')) {
          const fallbackProject = await prisma.project.findFirst();
          if (fallbackProject) {
             await prisma.review.create({
                data: {
                  rating: Number(rating),
                  comment: comment,
                  reviewerId: reviewerId,
                  professionalId: professional.userId,
                  projectId: fallbackProject.id
                }
             });
          } else {
             throw dbError;
          }
       } else {
          throw dbError;
       }
    }

    const newCount = (professional.reviewCount || 0) + 1;
    const currentTotal = (professional.rating || 0) * (professional.reviewCount || 0);
    const newRating = (currentTotal + Number(rating || 5)) / newCount;

    await prisma.professionalProfile.update({
      where: { id },
      data: { rating: newRating, reviewCount: newCount }
    });
    
    res.status(200).json({ message: 'Review submitted successfully', data: { rating: newRating } });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// 6. UPLOAD PORTFOLIO IMAGE (Multipart Disk Storage)
router.post('/portfolio/upload', authenticate, portfolioUploadMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const relativeUrl = `/uploads/portfolio/${file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Portfolio image uploaded successfully.',
      data: { url: relativeUrl },
    });
  } catch (error) {
    console.error('Portfolio image upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload portfolio image.' });
  }
});

// 7. ADD A PAST PROJECT (Stores only relative URLs / clean links in DB)
router.post('/portfolio', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { title, short_description, image_urls } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const professional = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (!professional) return res.status(404).json({ message: 'Professional not found' });

    // Sanitize any raw base64 data URLs to prevent PostgreSQL text array bloat
    const cleanedUrls: string[] = [];
    if (Array.isArray(image_urls)) {
      for (const url of image_urls) {
        if (typeof url === 'string') {
          if (url.startsWith('data:image/')) {
            const diskUrl = await storageService.saveBase64Image(url);
            cleanedUrls.push(diskUrl);
          } else {
            cleanedUrls.push(url);
          }
        }
      }
    }

    const newProject = await prisma.pastProject.create({
      data: {
        title: title,
        short_description: short_description,
        image_urls: cleanedUrls,
        professionalId: professional.id
      }
    });

    res.status(200).json({ success: true, data: newProject });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Failed to add project to portfolio' });
  }
});

export default router;