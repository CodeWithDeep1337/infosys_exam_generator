import React from "react";
import { Box, Typography, Button, Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const PageHeader = ({ title, subtitle, breadcrumbs = [], actionLabel, onAction, actionIcon }) => {
  return (
    <Box 
        sx={{ 
            mb: 4, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-end",
            animation: "fadeInDown 0.6s ease-out"
        }}
    >
      <Box>
        {breadcrumbs.length > 0 && (
            <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="breadcrumb"
                sx={{ mb: 1, fontSize: "0.875rem" }}
            >
                {breadcrumbs.map((crumb, index) => (
                    <Link 
                        key={index} 
                        underline="hover" 
                        color="inherit" 
                        href={crumb.href || "#"}
                        onClick={(e) => {
                            if (!crumb.href) e.preventDefault();
                        }}
                        sx={{ cursor: crumb.href ? "pointer" : "default" }}
                    >
                        {crumb.label}
                    </Link>
                ))}
            </Breadcrumbs>
        )}
        <Typography 
            variant="h4" 
            fontWeight="800" 
            sx={{ 
                background: "linear-gradient(45deg, #1e293b 30%, #334155 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px"
            }}
        >
          {title}
        </Typography>
        {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: "600px" }}>
            {subtitle}
            </Typography>
        )}
      </Box>

      {actionLabel && (
        <Button
          variant="contained"
          size="large"
          startIcon={actionIcon}
          onClick={onAction}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: "bold",
            px: 4,
            py: 1.5,
            boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
            background: "linear-gradient(to right, #2563eb, #3b82f6)",
            "&:hover": {
                 boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.4)",
                 transform: "translateY(-2px)"
            },
            transition: "all 0.3s ease"
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;
