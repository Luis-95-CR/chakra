import { FaWhatsapp } from "react-icons/fa6";
import { Logo } from "@/components/logo";
import { FooterNavLink } from "@/components/footer-nav-link";
import { getSettings } from "@/lib/store";
import { siteConfig } from "@/lib/config";

export async function SiteFooter() {
  const settings = await getSettings();

  const raw = (settings.whatsapp ?? siteConfig.whatsapp ?? "").replace(/\D/g, "");
  const local = raw.startsWith("506") && raw.length >= 11 ? raw.slice(3) : raw;
  const waDisplay = local ? `+506 ${local}` : null;
  const waHref = local ? `https://wa.me/506${local}` : null;

  return (
    <footer className="relative mt-auto bg-primary text-primary-foreground">
      {/* Main grid */}
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">

        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Logo className="size-11 text-primary-foreground" />
            <div className="leading-tight">
              <p className="font-display text-xl font-semibold tracking-tight">
                {siteConfig.name}
              </p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/60">
                {siteConfig.kicker}
              </p>
            </div>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            {siteConfig.heroSubtitle}
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Navegación
          </h3>
          <nav className="flex flex-col gap-2 text-sm">
            <FooterNavLink
              href="/"
              className="w-fit text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              Inicio
            </FooterNavLink>
            <FooterNavLink
              href="/productos"
              className="w-fit text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              Lista de precios
            </FooterNavLink>
          </nav>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Contacto
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            {waDisplay && waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-2 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                <FaWhatsapp className="size-4 shrink-0" />
                {waDisplay}
              </a>
            ) : (
              <p className="text-sm text-primary-foreground/40 italic">
                Sin número configurado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-xs text-primary-foreground/70">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>

    </footer>
  );
}
