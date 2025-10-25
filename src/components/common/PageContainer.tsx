import { Container } from "@mui/material";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}

export default function PageContainer({
  children,
  maxWidth = "lg",
}: PageContainerProps) {
  return <Container maxWidth={maxWidth}>{children}</Container>;
}
