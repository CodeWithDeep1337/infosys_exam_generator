import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

const MaterialList = ({ materials, onDelete }) => {
  const handleDownload = (fileUrl) => {
    // Backend URL + file path (e.g., http://localhost:8081/api/files/download/filename.pdf)
    window.open(
      `http://localhost:8081/api/files/download/${fileUrl}`,
      "_blank"
    );
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Topic Materials</Typography>
      <List>
        {materials.map((m) => (
          <ListItem
            key={m.id}
            divider
            secondaryAction={
              <>
                <IconButton onClick={() => handleDownload(m.fileUrl)}>
                  <DownloadIcon color="primary" />
                </IconButton>
                <IconButton onClick={() => onDelete(m.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={m.title} secondary={m.type} />
          </ListItem>
        ))}
        {materials.length === 0 && (
          <Typography variant="body2" sx={{ p: 2 }}>
            No materials uploaded yet.
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default MaterialList;
