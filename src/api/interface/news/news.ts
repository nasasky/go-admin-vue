export interface AddNewsReq {
  title: string;
  description?: string;
  content: string;
  cover_image?: string;
  sort?: number;
  status?: number;
}

export interface NewsItem extends AddNewsReq {
  id: number;
  created_at: string;
  updated_at: string;
} 