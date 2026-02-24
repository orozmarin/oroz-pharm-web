import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  light?: boolean;
}

export default function LeafDivider({ className, light }: Props) {
  return (
    <div className={cn("flex items-center justify-center py-8 px-4", className)}>
      <div className={cn("h-px flex-1 max-w-32", light ? "bg-white/60" : "bg-green-200")} />
      <svg
        viewBox="0 0 40 40"
        className={cn("w-10 h-10 mx-4", light ? "text-white/90" : "text-green-500")}
        fill="currentColor"
      >
        <path d="M20 2C14 8 4 14 4 24c0 6 4 10 8 12 1-4 3-8 8-12-5 6-7 10-7 14 2 1 4 1 7 0 3-1 5-2 7-4C31 30 34 24 34 18c0-6-4-10-14-16z" />
      </svg>
      <div className={cn("h-px flex-1 max-w-32", light ? "bg-white/60" : "bg-green-200")} />
    </div>
  );
}
