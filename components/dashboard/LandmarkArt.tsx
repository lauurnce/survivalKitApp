// components/dashboard/LandmarkArt.tsx
import Image from "next/image";
import { findLandmark, landmarkArt } from "@/lib/landmarks";

interface Props {
  university: string | null;
  className?: string;
}

export function LandmarkArt({ university, className = "" }: Props) {
  const { src, label } = landmarkArt(findLandmark(university));
  const isSvg = src.endsWith(".svg");
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      {isSvg ? (
        // The committed fallback — plain <img>, no optimizer round-trip needed.
        <img src={src} alt="" className="h-full w-full object-contain" />
      ) : (
        <Image src={src} alt="" width={480} height={360} title={label}
          className="h-full w-full object-contain" priority />
      )}
    </div>
  );
}
