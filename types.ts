
export enum Step {
  UPLOAD_PRODUCT,
  SELECT_MODEL,
  SELECT_VIBE,
  GENERATING,
  SHOW_RESULTS,
}

export interface Model {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Vibe {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface ProductImage {
  base64: string;
  mimeType: string;
}

export interface GeneratedContent {
  image: string | null;
  videoUrl: string | null;
  caption: string | null;
}
