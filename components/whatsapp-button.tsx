"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa6";

interface WhatsAppButtonProps {
  phone: string;
}

export function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const pathname = usePathname();

  if (!phone || pathname.startsWith("/admin")) return null;

  const clean = phone.replace(/\D/g, "");
  const href = `https://wa.me/${clean}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
    >
      <FaWhatsapp className="size-7" />
    </a>
  );
}
