export type UserRole = 'HOMEOWNER' | 'PROFESSIONAL' | 'ADMIN' | 'FOUNDER';

export type ProjectType =
  | 'NEW_CONSTRUCTION'
  | 'RENOVATION'
  | 'INTERIOR'
  | 'ARCHITECTURE'
  | 'STRUCTURAL'
  | 'CIVIL_WORK'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'OTHER';

export type ProjectStatus =
  | 'DRAFT'
  | 'POSTED'
  | 'PUBLISHED'
  | 'MATCHING'
  | 'PROFESSIONALS_INTERESTED'
  | 'QUOTES_RECEIVED'
  | 'SHORTLISTED'
  | 'PROFESSIONAL_SELECTED'
  | 'AGREEMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'EXPIRED';

export type VerificationStatus =
  | 'NOT_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RESUBMIT_REQUIRED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  mobileNumber: string;
  role: UserRole;
  status: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  city: string;
  createdAt: string;
  homeownerProfile?: {
    fullName: string;
    totalProjectsPosted: number;
  };
  professionalProfile?: {
    id: string;
    fullName: string;
    companyName: string;
    category: ProjectType;
    yearsOfExperience: number;
    verificationStatus: VerificationStatus;
    rating: number;
    completedProjectsCount: number;
  };
}

export interface Project {
  id: string;
  homeownerId: string;
  title: string;
  projectType: ProjectType;
  status: ProjectStatus;
  address: string;
  city: string;
  state: string;
  pincode: string;
  propertyType: string;
  plotSizeSqFt?: number;
  builtUpAreaSqFt?: number;
  floorsCount?: number;
  bedroomsCount?: number;
  bathroomsCount?: number;
  description: string;
  minBudget: number;
  maxBudget: number;
  budgetType: string;
  preferredStartDate?: string;
  expectedCompletionDate?: string;
  urgencyLevel: string;
  publishedAt?: string;
  createdAt: string;
  quotes?: Quote[];
  documents?: any[];
  milestones?: Milestone[];
  matchPercentage?: number;
  hasSubmittedQuote?: boolean;
}

export interface QuoteItem {
  id?: string;
  category: 'LABOUR' | 'MATERIAL' | 'EQUIPMENT' | 'TRANSPORTATION' | 'SUBCONTRACTOR' | 'DESIGN' | 'OTHER';
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalRate: number;
}

export interface Quote {
  id: string;
  projectId: string;
  professionalId: string;
  status: QuoteStatus;
  subtotal: number;
  professionalFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  estimatedDays: number;
  paymentTerms: string;
  notes?: string;
  validUntil: string;
  createdAt: string;
  items: QuoteItem[];
  professional?: {
    id: string;
    email: string;
    professionalProfile?: any;
  };
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  sequenceOrder: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  completionPercentage: number;
}
