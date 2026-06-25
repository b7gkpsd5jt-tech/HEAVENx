export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl skeleton" />
      <div className="mt-3 h-4 skeleton rounded-lg w-3/4" />
      <div className="mt-2 h-3 skeleton rounded-lg w-1/2" />
    </div>
  );
}
