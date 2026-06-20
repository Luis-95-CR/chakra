"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A footer nav link that scrolls to the top when clicked while already on the
 * target route (a plain <Link> to the current route does nothing otherwise).
 */
export function FooterNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (pathname === href) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      {children}
    </Link>
  );
}
