import Image from "next/image";

export const BRAND = {
  name: "Video Trading Course",
  // PLACEHOLDER: vervang later door echte Supabase signed URL
  logoUrl: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/sign/Cryptoriez/platform_logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MGRiNGFlMi1mMDRjLTRjYjMtOTVlYi1lZGQzNTlmOGExM2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDcnlwdG9yaWV6L3BsYXRmb3JtX2xvZ28ucG5nIiwiaWF0IjoxNzYyMTYzNDc5LCJleHAiOjE3OTM2OTk0Nzl9.__xBQxzqu5sJld4z0d3CsL4yf5aMGAySop22cr5CM3M",
};

export function BrandLogo({className=""}:{className?:string}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image src={BRAND.logoUrl} alt="Platform Logo" width={36} height={36} className="rounded" />
      <span className="font-semibold tracking-tight">Video Trading Course</span>
    </div>
  );
}

