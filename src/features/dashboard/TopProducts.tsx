import { Skeleton } from "@/components/ui/skeleton"
import type { TopProduct } from "@/lib/metrics"

type TopProductsProps = {
  products: TopProduct[]
}

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">No purchases yet.</p>
  }

  return (
    <ol className="flex flex-col gap-1">
      {products.map((product, i) => (
        <li key={product.productId} className="flex items-center gap-3 rounded-md px-1 py-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">{product.title}</span>
          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {product.quantity} sold
          </span>
        </li>
      ))}
    </ol>
  )
}

export function TopProductsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  )
}