import { Alert } from "@mui/material";

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <Alert severity="error" sx={{ mb: 2 }} onClose={onClose}>
      {message}
    </Alert>
  );
}
