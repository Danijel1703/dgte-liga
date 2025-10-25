import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && <Box sx={{ color: "primary.main" }}>{icon}</Box>}
          <Typography variant="h4" className="font-semibold text-gray-800">
            {title}
          </Typography>
        </div>
        {actions && <Box>{actions}</Box>}
      </div>
      {subtitle && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
