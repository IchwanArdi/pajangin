import type { Feedback } from '../generated/prisma/client.js';

// Kontrak API memakai snake_case, sama seperti endpoint dashboard lainnya.
export interface FeedbackResponse {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_whatsapp: string | null;
  business_id: string | null;
  business_name: string | null;
  source: string;
  category: string;
  rating: number | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function toFeedbackResponse(feedback: Feedback): FeedbackResponse {
  return {
    id: feedback.id,
    user_id: feedback.userId,
    user_name: feedback.userName,
    user_email: feedback.userEmail,
    user_whatsapp: feedback.userWhatsapp,
    business_id: feedback.businessId,
    business_name: feedback.businessName,
    source: feedback.source,
    category: feedback.category,
    rating: feedback.rating,
    message: feedback.message,
    status: feedback.status,
    created_at: feedback.createdAt.toISOString(),
    updated_at: feedback.updatedAt.toISOString(),
  };
}
