import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import BookIcon from "@mui/icons-material/Book";
import SubjectIcon from "@mui/icons-material/Assignment";
import TopicIcon from "@mui/icons-material/ListAlt";
import QuizIcon from "@mui/icons-material/Psychology";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardIcon from "@mui/icons-material/Dashboard";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    // Use replace to prevent the user from going back to protected pages
    navigate("/login", { replace: true });
    // Reloading ensures all state is wiped clean
    window.location.reload();
  };

  // Helper to determine if a menu item is active
  const isActive = (path) => location.pathname === path;

  return (
    <Box
      sx={{
        width: 260,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#1a2035",
        color: "white",
        position: "sticky",
        top: 0,
        boxShadow: "4px 0 12px rgba(0,0,0,0.2)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          p: 3,
          textAlign: "center",
          fontWeight: "800",
          letterSpacing: 1.5,
          color: "#60a5fa",
        }}
      >
        SkillForge
      </Typography>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 2 }} />

      <List sx={{ flexGrow: 1, pt: 2, px: 1 }}>
        {/* --- DASHBOARD --- */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => navigate("/instructor/dashboard")}
            selected={isActive("/instructor/dashboard")}
            sx={{
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "rgba(96, 165, 250, 0.15)" },
            }}
          >
            <ListItemIcon>
              <DashboardIcon
                sx={{
                  color: isActive("/instructor/dashboard") ? "#60a5fa" : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        {/* --- COURSES --- */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => navigate("/instructor/courses")}
            selected={isActive("/instructor/courses")}
            sx={{
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "rgba(96, 165, 250, 0.15)" },
            }}
          >
            <ListItemIcon>
              <BookIcon
                sx={{
                  color: isActive("/instructor/courses") ? "#60a5fa" : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Courses" />
          </ListItemButton>
        </ListItem>

        {/* --- SUBJECTS --- */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => navigate("/instructor/subjects")}
            selected={isActive("/instructor/subjects")}
            sx={{
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "rgba(96, 165, 250, 0.15)" },
            }}
          >
            <ListItemIcon>
              <SubjectIcon
                sx={{
                  color: isActive("/instructor/subjects") ? "#60a5fa" : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Subjects" />
          </ListItemButton>
        </ListItem>

        {/* --- TOPICS --- */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => navigate("/instructor/topics")}
            selected={isActive("/instructor/topics")}
            sx={{
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "rgba(96, 165, 250, 0.15)" },
            }}
          >
            <ListItemIcon>
              <TopicIcon
                sx={{
                  color: isActive("/instructor/topics") ? "#60a5fa" : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Topics" />
          </ListItemButton>
        </ListItem>

        {/* --- QUIZZES --- */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => navigate("/instructor/quizzes")}
            selected={isActive("/instructor/quizzes")}
            sx={{
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "rgba(96, 165, 250, 0.15)" },
            }}
          >
            <ListItemIcon>
              <QuizIcon
                sx={{
                  color: isActive("/instructor/quizzes") ? "#60a5fa" : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Quizzes" />
            <Chip
              label="AI"
              size="small"
              sx={{
                height: 16,
                fontSize: "0.65rem",
                bgcolor: "#60a5fa",
                color: "#1a2035",
                fontWeight: "bold",
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* --- REPORTS --- */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => navigate("/instructor/reports")}
            selected={isActive("/instructor/reports")}
            sx={{
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "rgba(96, 165, 250, 0.15)" },
            }}
          >
            <ListItemIcon>
              <AssessmentIcon
                sx={{
                  color: isActive("/instructor/reports") ? "#60a5fa" : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }} />

      <Box sx={{ p: 2, pb: 4 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
