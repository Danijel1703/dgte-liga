import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentReminderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentReminderModal({
  open,
  onClose,
}: PaymentReminderModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Obavijest o članarini</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Niste platili članarinu za ovaj mjesec.
        </p>
        <DialogFooter>
          <Button onClick={onClose}>U redu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
