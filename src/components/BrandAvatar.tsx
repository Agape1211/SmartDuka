import Image from "next/image";

export function BrandAvatar({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/dukasmart.png"
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      aria-hidden="true"
    />
  );
}
