import type { VerificationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VERIFICATION_STATUS_LABELS, VERIFICATION_STATUS_STYLES } from "@/lib/labels";

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", VERIFICATION_STATUS_STYLES[status])}>
      {VERIFICATION_STATUS_LABELS[status]}
    </Badge>
  );
}
