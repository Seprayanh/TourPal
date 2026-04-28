import Container from "@/components/container";
function SkeletonRow() {
  return (
    <div className="animate-pulse border border-neutral-200 rounded-xl p-4 flex gap-4">
      <div className="w-24 h-24 rounded-lg bg-neutral-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-neutral-200 rounded w-2/3" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
        <div className="h-8 bg-neutral-200 rounded w-24 mt-2" />
      </div>
    </div>
  );
}
export default function GuideLoading() {
  return (
    <Container>
      <div className="pt-24 pb-6">
        <div className="h-7 bg-neutral-200 rounded w-32 animate-pulse mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-48 animate-pulse" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </Container>
  );
}
