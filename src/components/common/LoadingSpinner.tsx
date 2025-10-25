import { Box, CircularProgress } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export default function LoadingSpinner({
  size = 40,
  message = "Učitavanje...",
}: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && <Box sx={{ color: "text.secondary" }}>{message}</Box>}
    </Box>
  );
}
