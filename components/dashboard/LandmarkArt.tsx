// components/dashboard/LandmarkArt.tsx
import Image from "next/image";
import { matchUniversity, universityImagePath } from "@/lib/universities";

interface Props {
  university: string | null;
  className?: string;
}

export function LandmarkArt({ university, className = "" }: Props) {
  const src = universityImagePath(university);
  const label = matchUniversity(university)?.name ?? "Campus building";
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <Image
        src={src}
        alt=""
        width={480}
        height={360}
        title={label}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}
