import Container from "@/components/container";
function SkeletonCard() {
  return (
    <div className="col-span-1 animate-pulse">
      <div className="flex flex-col gap-2 w-full">
        <div className="aspect-square w-full rounded-xl bg-neutral-200" />
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
  );
}
export default function TripsLoading() {
  return (
    <Container>
      <div className="pt-24 pb-6">
        <div className="h-7 bg-neutral-200 rounded w-36 animate-pulse mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-56 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </Container>
  );
}
