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
        className={`bg-primary text-black font-bold rounded-full hover:bg-primary-dark hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all duration-300 ${className}`}
      >
        {text}
      </Button>
    </a>
  );
}
