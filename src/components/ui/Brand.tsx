import Image from "next/image";

export type Brand = {
  name: string;
  logoIconUrl: string;
  logoWithTextUrl: string;
  logoUrl: string;
};

export const BRAND: Brand = {
  name: "Het Trade Platform",
  // Logo icon (1:1 aspect ratio) - voor gebruik in navbars, favicons, etc.
  logoIconUrl: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/sign/Cryptoriez/new_logo_icon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MGRiNGFlMi1mMDRjLTRjYjMtOTVlYi1lZGQzNTlmOGExM2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDcnlwdG9yaWV6L25ld19sb2dvX2ljb24ucG5nIiwiaWF0IjoxNzY0MzQwMDkwLCJleHAiOjE3OTU4NzYwOTB9.zslt1cNW0Q4_w_2uKyACm6iyCxqhA3nqq4-AsGwgmSk",
  // Logo met tekst (928 × 160) - voor gebruik op login pagina, footer, etc.
  logoWithTextUrl: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/sign/Cryptoriez/logo_text.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MGRiNGFlMi1mMDRjLTRjYjMtOTVlYi1lZGQzNTlmOGExM2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDcnlwdG9yaWV6L2xvZ29fdGV4dC5wbmciLCJpYXQiOjE3NjQzNDAxMDQsImV4cCI6MTc5NTg3NjEwNH0.Ryvf-cFvV8afim0ql3pH4s1vX56zih2lJ0CJ3Wp2fu8",
  // Backward compatibility - gebruik icon als default
  logoUrl: "https://trogwrgxxhsvixzglzpn.supabase.co/storage/v1/object/sign/Cryptoriez/new_logo_icon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MGRiNGFlMi1mMDRjLTRjYjMtOTVlYi1lZGQzNTlmOGExM2MiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDcnlwdG9yaWV6L25ld19sb2dvX2ljb24ucG5nIiwiaWF0IjoxNzY0MzQwMDkwLCJleHAiOjE3OTU4NzYwOTB9.zslt1cNW0Q4_w_2uKyACm6iyCxqhA3nqq4-AsGwgmSk",
};

export function BrandLogo({className=""}:{className?:string}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image src={BRAND.logoIconUrl} alt="Platform Logo" width={36} height={36} className="rounded" />
      <span className="font-semibold tracking-tight">Het Trade Platform</span>
    </div>
  );
}

