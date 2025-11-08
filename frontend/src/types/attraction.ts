export type MarkerConfig = {
  preset?: string | null;
  patternUrl?: string | null;
  barcodeValue?: number | null;
};

export type ImageNFTConfig = {
  nftBaseUrl?: string | null;
};

export type LocationConfig = {
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
};

export type Attraction = {
  id: string;
  name: string;
  type: string;
  marker?: MarkerConfig | null;
  imageNFT?: ImageNFTConfig | null;
  location?: LocationConfig | null;
  videoUrl?: string | null;
  thumbnail?: string | null;
  city?: string | null;
  description?: string | null;
};

export type AttractionResponse = {
  data: Attraction[];
};

