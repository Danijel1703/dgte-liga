import { Box, Card, CardContent, Typography } from "@mui/material";
import { ReactNode } from "react";

interface LoginCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function LoginCard({
  title,
  subtitle,
  children,
}: LoginCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-8!">
        <Box className="text-center mb-5">
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
