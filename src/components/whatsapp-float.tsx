import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <a
      href={SITE.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="wa-float"
      aria-label={`WhatsApp ${SITE.whatsappDisplay}`}
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">Chat now</span>
    </a>
  );
}
