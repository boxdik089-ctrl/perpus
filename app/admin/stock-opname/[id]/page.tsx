import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getStockOpnameDetail } from "@/actions/stock-opname";
import { StockOpnameDetailClient } from "@/components/admin/stock-opname/StockOpnameDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StockOpnameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const data = await getStockOpnameDetail(id);

  if (!data || !data.sesi) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-sky-500 selection:text-white relative overflow-x-hidden font-sans transition-colors duration-300">


      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <StockOpnameDetailClient
          sesi={data.sesi as any}
          summary={data.summary}
          allRaks={data.allRaks}
        />
      </div>
    </div>
  );
}
