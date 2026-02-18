import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  light?: boolean;
}

export default function SectionHeading({ title, subtitle, className, light }: Props) {
  return (
    <div className={cn("text-center mb-12", className)}>
      <h2 className={cn(
        "text-3xl md:text-4xl lg:text-5xl font-bold mb-4",
        light ? "text-white" : "text-green-900"
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "text-lg max-w-2xl mx-auto",
          light ? "text-green-100" : "text-gray-600"
        )}>
          {subtitle}
        </p>
      )}
      <div className={cn(
        "w-24 h-1 mx-auto mt-6 rounded-full",
        light ? "bg-green-400" : "bg-green-600"
      )} />
    </div>
  );
}
