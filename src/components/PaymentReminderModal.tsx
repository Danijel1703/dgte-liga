import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface PaymentReminderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentReminderModal({
  open,
  onClose,
}: PaymentReminderModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Obavijest o članarini"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Niste platili članarinu za ovaj mjesec.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          U redu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
