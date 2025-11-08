import type React from "react";

export {};

declare global {
  interface Window {
    CamaraApi?: {
      requestQualityOnDemand?: (phoneNumber: string, profileId: string) => Promise<{ sessionId?: string }>;
      stopQualityOnDemand?: (sessionId: string) => Promise<void>;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      "a-scene": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, any>;
      "a-assets": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, any>;
      "a-entity": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, any>;
      "a-marker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, any>;
      "a-video": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, any>;
      "a-nft": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, any>;
    }
  }
}

