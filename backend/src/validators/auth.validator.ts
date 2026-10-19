import { z } from 'zod';

export const HomeownerSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  mobileNumber: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  city: z.string().min(2, 'City is required'),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept Terms & Conditions' }) }),
});

export const ProfessionalSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  mobileNumber: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  category: z.enum([
    'NEW_CONSTRUCTION',
    'RENOVATION',
    'INTERIOR',
    'ARCHITECTURE',
    'STRUCTURAL',
    'CIVIL_WORK',
    'ELECTRICAL',
    'PLUMBING',
    'OTHER',
  ]),
  city: z.string().min(2, 'City is required'),
  yearsOfExperience: z.number().min(0, 'Years of experience must be 0 or more'),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept Terms & Conditions' }) }),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const OtpRequestSchema = z
  .object({
    mobileNumber: z.string().optional(),
    phone: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => !!(data.mobileNumber || data.phone || data.phoneNumber), {
    message: 'Valid mobile number is required',
  });

export const OtpVerifySchema = z
  .object({
    mobileNumber: z.string().optional(),
    phone: z.string().optional(),
    phoneNumber: z.string().optional(),
    otp: z.string().min(4, 'OTP is required').max(8, 'OTP must be 6 digits'),
  })
  .refine((data) => !!(data.mobileNumber || data.phone || data.phoneNumber), {
    message: 'Valid mobile number is required',
  });
