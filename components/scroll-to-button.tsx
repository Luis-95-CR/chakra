"use client";

import { Button } from "@/components/ui/button";

/**
 * A button that smooth-scrolls to an element by id, without writing a hash to
 * the URL (a plain anchor link would push "#id" into the address bar).
 */
export function ScrollToButton({
  targetId,
  className,
  children,
}: {
  targetId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="lg"
      className={className}
      onClick={() => {
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </Button>
  );
}
