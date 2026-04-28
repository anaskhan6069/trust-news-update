"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ApproveButtonProps {
  draftId: string;
  isLoading?: boolean;
  onApprove: (draftId: string) => void;
}

export function ApproveButton({ draftId, isLoading = false, onApprove }: ApproveButtonProps): JSX.Element {
  return (
    <Button size="sm" variant="success" onClick={() => onApprove(draftId)} disabled={isLoading}>
      {isLoading ? <Spinner /> : <Check className="h-4 w-4" />}
      Approve
    </Button>
  );
}
