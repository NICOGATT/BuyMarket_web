

function ProductCardSkeleton() {
  return (
    <article className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-40 rounded bg-slate-200"/>
        <div className="h-6 w-2/3 rounded bg-slate-200"/>
        <div className="mt-3 h-4 w-full rounded bg-slate-200"/>
        <div className="mt-2 h-4 w-3/4 rounded bg-slate-200"/>
        <div className="mt-6 flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-slate-200"/>
            <div className="h-12 w-28 rounded-xl bg-slate-200"/>
        </div>
    </article>
  )
}

export default ProductCardSkeleton