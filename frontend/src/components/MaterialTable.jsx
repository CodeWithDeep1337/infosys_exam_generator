import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Box,
} from "@mui/material";
import {
  OpenInNew as OpenIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  PlayCircle as VideoIcon,
  Link as LinkIcon,
} from "@mui/icons-material";

const MaterialTable = ({ materials = [], onOpen, onDelete }) => {
  const getTypeIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return <FileIcon fontSize="small" />;
      case "VIDEO":
        return <VideoIcon fontSize="small" />;
      case "LINK":
        return <LinkIcon fontSize="small" />;
      default:
        return <FileIcon fontSize="small" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return "error";
      case "VIDEO":
        return "warning";
      case "LINK":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
          <TableRow>
            <TableCell>
              <strong>Type</strong>
            </TableCell>
            <TableCell>
              <strong>Title</strong>
            </TableCell>
            <TableCell>
              <strong>File/URL</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {materials.length > 0 ? (
            materials.map((material) => {
              const materialId = material.id || material._id;
              const isLink = material.type?.toUpperCase() === "LINK";
              const displayUrl = isLink
                ? material.url || material.link || "No URL"
                : material.filePath || "No file";

              return (
                <TableRow key={materialId} hover>
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(material.type)}
                      label={material.type || "Unknown"}
                      color={getTypeColor(material.type)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {material.title}
                  </TableCell>
                  <TableCell sx={{ maxWidth: "300px", overflow: "hidden" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {displayUrl}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Open">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onOpen && onOpen(material)}
                      >
                        <OpenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete && onDelete(materialId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  No materials found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaterialTable;
