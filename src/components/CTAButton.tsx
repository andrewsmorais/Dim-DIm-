import { Button } from "@/components/ui/button";

interface CTAButtonProps {
  text: string;
  size?: "default" | "sm" | "lg";
  className?: string;
  href?: string;
}

export function CTAButton({ text, size = "default", className = "", href }: CTAButtonProps) {
  const asaasUrl = process.env.NEXT_PUBLIC_ASAAS_CHECKOUT_URL || "#";
  const finalHref = href || asaasUrl;

  return (
    <a href={finalHref} target="_blank" rel="noopener noreferrer" className="inline-block group">
      <Button 
        size={size} 
        className={`bg-brand-dark text-white font-bold rounded-full hover:bg-green-900 hover:scale-105 hover:shadow-lg hover:shadow-brand-dark/30 transition-all duration-300 ${className}`}
      >
        {text}
      </Button>
    </a>
  );
}
