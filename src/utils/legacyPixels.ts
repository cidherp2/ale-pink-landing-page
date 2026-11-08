import { useNavigate } from "react-router-dom";

const LEGACY_OWNER_ID =
  import.meta.env.VITE_LEGACY_PIXEL_OWNER_ID ??
  "58076fba-e74e-424d-8823-3d4481b29563";

let pixelLoad: Promise<void> | null = null;
let isolatedPage = false;

export const isLegacyPixelOwner = (ownerId: string | null | undefined) =>
  ownerId === LEGACY_OWNER_ID;

export const loadLegacyPixels = () => {
  if (pixelLoad) return pixelLoad;

  isolatedPage = true;
  window.addEventListener("popstate", () => window.location.reload());
  pixelLoad = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/legacy-pixels.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudieron cargar los píxeles."));
    document.head.appendChild(script);
  });
  return pixelLoad;
};

export const useIsolatedNavigate = () => {
  const navigate = useNavigate();
  return (path: string) => {
    if (isolatedPage) {
      window.location.assign(path);
    } else {
      navigate(path);
    }
  };
};
