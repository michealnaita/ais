import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SsoButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={onClick}
    >
      <Landmark size={18} />
      Continue with university SSO
    </Button>
  );
}
