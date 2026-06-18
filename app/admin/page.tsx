import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { isAuthenticated } from "@/lib/session";
import { getCatalog, getSettings } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { LoginForm } from "./login-form";
import { AdminPanel } from "./admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <LoginForm />
        </main>
        <SiteFooter />
      </>
    );
  }

  const [{ products, lastUploadAt }, settings] = await Promise.all([
    getCatalog(),
    getSettings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-4">
        <AdminPanel
          products={products}
          lastUploadAt={products.length > 0 ? formatDate(lastUploadAt) : null}
          settings={settings}
        />
      </main>
      <SiteFooter />
    </>
  );
}
