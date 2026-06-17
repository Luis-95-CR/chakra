import { SiteHeader } from "@/components/site-header";
import { isAuthenticated } from "@/lib/session";
import { getCatalog } from "@/lib/store";
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
      </>
    );
  }

  const { products, lastUploadAt } = await getCatalog();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <AdminPanel
          currentCount={products.length}
          lastUploadAt={products.length > 0 ? formatDate(lastUploadAt) : null}
        />
      </main>
    </>
  );
}
