export default function ProductsLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="relative h-[50vh] min-h-[400px] bg-green-900 animate-pulse" />

      {/* Brand marquee placeholder */}
      <div className="h-20 bg-white border-y border-green-100" />

      {/* Category grid skeleton */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div
            className="hidden md:grid gap-4"
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {Array.from({ length: 13 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-green-100 animate-pulse"
                style={{ minHeight: 240 }}
              />
            ))}
          </div>
          <div className="md:hidden grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-green-100 animate-pulse"
                style={{ minHeight: 180 }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
