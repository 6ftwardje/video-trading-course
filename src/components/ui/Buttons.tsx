import Link from "next/link";

export function AccentButton(
  {href, children, className="", onClick}:{href?:string; children:React.ReactNode; className?:string; onClick?:()=>void}
){
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-[var(--accent)] text-black hover:opacity-90 transition";
  if (href) return <Link href={href} className={`${base} ${className}`}>{children}</Link>;
  return <button onClick={onClick} className={`${base} ${className}`}>{children}</button>;
}

