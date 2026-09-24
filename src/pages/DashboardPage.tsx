import { Users, ShoppingCart, DollarSign, Crown } from "lucide-react"
import { useDashboardData } from "@/features/dashboard/use-dashboard-data"
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard"
import { PageHeader } from "@/components/shared/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useAuth } from "@/features/auth/auth-context"
import { DashboardSection } from "@/features/dashboard/DashboardSection"
import {
  PurchaseStatusBreakdown,
  PurchaseStatusBreakdownSkeleton,
} from "@/features/dashboard/PurchaseStatusBreakdown"
import {
  CustomerSegmentation,
  CustomerSegmentationSkeleton,
} from "@/features/dashboard/CustomerSegmentation"
import { TopProducts, TopProductsSkeleton } from "@/features/dashboard/TopProducts"
import { computeKeyInsights } from "@/lib/insights"
import { KeyInsights, KeyInsightsSkeleton } from "@/features/dashboard/KeyInsights"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  if (hour < 21) return "Good evening"
  return "Good night"
}

export function DashboardPage() {
  const { user } = useAuth()
  const {
    metrics,
    segments,
    topProducts,
    isLoading,
    customersError,
    purchasesError,
    refetch,
  } = useDashboardData()

  const bothFailed = customersError && purchasesError
  const oneFailed = (customersError || purchasesError) && !bothFailed
  const highValueCount = segments?.filter((s) => s.segment === "high-value").length ?? 0

  if (bothFailed) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title={`${getGreeting()}, ${user?.firstName ?? ""}`}
          subtitle="Here's what's happening with your customers today."
        />
        <ErrorState title="Couldn't load dashboard metrics" onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${getGreeting()}, ${user?.firstName ?? ""}`}
        subtitle="Here's what's happening with your customers today."
      />

      {oneFailed && (
        <ErrorState
          title="Some data couldn't be loaded"
          onRetry={refetch}
          className="py-8"
        />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !metrics ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Total Customers" value={formatNumber(metrics.totalCustomers)} icon={Users} />
            <StatCard label="Total Purchases" value={formatNumber(metrics.totalPurchases)} icon={ShoppingCart} />
            <StatCard
              label="Average Order Value"
              value={formatCurrency(metrics.averageOrderValue)}
              icon={DollarSign}
            />
            <StatCard label="High Value Customers" value={formatNumber(highValueCount)} icon={Crown} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DashboardSection title="Purchase Status" subtitle="Breakdown of all purchases by status">
          {isLoading || !metrics ? (
            <PurchaseStatusBreakdownSkeleton />
          ) : (
            <PurchaseStatusBreakdown statusBreakdown={metrics.statusBreakdown} />
          )}
        </DashboardSection>

        <DashboardSection title="Customer Segments" subtitle="Distribution of your customer base">
          {isLoading || !segments ? (
            <CustomerSegmentationSkeleton />
          ) : (
            <CustomerSegmentation segments={segments} />
          )}
        </DashboardSection>
      </div>

      <DashboardSection title="Top Products" subtitle="Best-selling products by quantity purchased">
        {isLoading || !topProducts ? <TopProductsSkeleton /> : <TopProducts products={topProducts} />}
      </DashboardSection>

      <DashboardSection title="Key Insights" className="border-none bg-accent shadow-none">
        {isLoading || !metrics || !segments || !topProducts ? (
          <KeyInsightsSkeleton />
        ) : (
          <KeyInsights insights={computeKeyInsights(metrics, segments, topProducts)} />
        )}
      </DashboardSection>
    </div>
  )
}