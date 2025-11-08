import { useEffect } from "react";

export function useArBodyClass(): void {
  useEffect(() => {
    document.body.classList.add("ar-mode");
    return () => {
      document.body.classList.remove("ar-mode");
    };
  }, []);
}

