export {};

declare global {
  interface Window {
    CamaraApi?: {
      requestQualityOnDemand?: (phoneNumber: string, profileId: string) => Promise<{ sessionId?: string }>;
      stopQualityOnDemand?: (sessionId: string) => Promise<void>;
    };
  }
}

