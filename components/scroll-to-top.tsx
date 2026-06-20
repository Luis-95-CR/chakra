"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Forces the window to the very top on every route change. Without this the
 * App Router can restore a previous scroll position, leaving the top of the
 * page tucked under the sticky header.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
