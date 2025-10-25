import { Alert } from "@mui/material";

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
}

export default function SuccessMessage({
  message,
  onClose,
}: SuccessMessageProps) {
  return (
    <Alert severity="success" sx={{ mb: 2 }} onClose={onClose}>
      {message}
    </Alert>
  );
}
