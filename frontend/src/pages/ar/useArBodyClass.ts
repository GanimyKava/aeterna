import { useEffect } from "react";

export function useArBodyClass(): void {
  useEffect(() => {
    const html = document.documentElement;
    document.body.classList.add("ar-mode");
    html.classList.add("ar-mode");
    return () => {
      document.body.classList.remove("ar-mode");
      html.classList.remove("ar-mode");
    };
  }, []);
}

