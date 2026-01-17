import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const CourseTable = ({ courses, onEdit, onDelete }) => {
  // Helper to style difficulty chips
  const getDifficultyColor = (level) => {
    switch (level) {
      case "Beginner":
        return "success";
      case "Intermediate":
        return "warning";
      case "Advanced":
        return "error";
      default:
        return "default";
    }
  };

  // Helper to format Date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "—";
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="courses table">
        <TableHead sx={{ backgroundColor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              Title
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              Description
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              Difficulty
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              Duration
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
              Created At
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", color: "#475569" }}
              align="center"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <TableRow
                key={course.id || Math.random()}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {course.title || "Untitled Course"}
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 250,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "#64748b",
                  }}
                >
                  {course.description || "No description provided"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={course.difficulty || "N/A"}
                    color={getDifficultyColor(course.difficulty)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                </TableCell>
                <TableCell sx={{ color: "#334155" }}>
                  {course.duration || "—"}
                </TableCell>
                <TableCell sx={{ color: "#334155" }}>
                  {formatDate(course.createdAt)}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Course">
                    <IconButton
                      color="primary"
                      onClick={() => onEdit && onEdit(course)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Course">
                    <IconButton
                      color="error"
                      onClick={() => onDelete && onDelete(course.id)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                <Typography variant="body1" color="text.secondary">
                  No courses found in the database.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CourseTable;
