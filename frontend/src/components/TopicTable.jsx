import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";

const TopicTable = ({ topics, onDelete, onManageMaterials, onEdit }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case "PDF":
        return "error";
      case "VIDEO":
        return "primary";
      case "YOUTUBE":
        return "error";
      case "LINK":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell>
              <strong>Topic Name</strong>
            </TableCell>
            <TableCell>
              <strong>Subject</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id} hover>
              <TableCell>{topic.name}</TableCell>
              <TableCell>{topic.subjectName || "Unassigned"}</TableCell>
              <TableCell align="right">
                <IconButton color="primary" onClick={() => onEdit && onEdit(topic)}>
                    <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => onManageMaterials(topic)}>
                    <UploadIcon />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(topic.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TopicTable;
