import React, { useState, useEffect } from "react";
import { color, motion } from "framer-motion";
import {
  Avatar,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
  Paper,
  Badge,
  alpha,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    createdAt: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });

  const userId = sessionStorage.getItem("uID");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/victim/${userId}`
        );
        const data = response.data[0];
        setUserData({
          name: data.name,
          email: data.email,
          password: data.password,
          createdAt: new Date(data.createdAt).toLocaleDateString(),
        });
        setFormData({
          name: data.name,
          email: data.email,
          password: data.password,
          createdAt: new Date(data.createdAt).toLocaleDateString(),
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateClick = () => setIsEditing(true);

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/victim/${userId}`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );
      setUserData({ ...formData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
  };

  const headerBgStyle = {
    background: "linear-gradient(135deg, #1a237e, #d32f2f)",
    color: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(211, 47, 47, 0.3)",
    position: "relative",
    overflow: "hidden",
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f7fa",
        pt: 3,
        pb: 3,
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            elevation={0}
            sx={{
              ...headerBgStyle,
              mb: 4,
              p: { xs: 3, md: 4 },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                top: "-150px",
                right: "-100px",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                bottom: "-100px",
                left: "-50px",
              }}
            />

            <IconButton
              onClick={() => {
                navigate("/user/home"); 
              }}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "white", 
                // backgroundColor: alpha(theme.palette.primary.main, 0.2), 
                transition: "all 0.3s ease", 
                "&:hover": {
                  backgroundColor: "white", 
                  color: theme.palette.primary.main, 
                  transform: "scale(1.1)", 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", 
                },
              }}
            >
              <HomeIcon  />
            </IconButton>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                position: "relative",
              }}
            >
              Account Settings
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                opacity: 0.9,
                position: "relative",
              }}
            >
              Manage your profile and preferences
            </Typography>

            <Box
              sx={{
                mt: 4,
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  isEditing && (
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.light,
                        color: "white",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        border: "2px solid white",
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      <CameraAltOutlinedIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <Avatar
                  sx={{
                    width: 90,
                    height: 90,
                    fontSize: 36,
                    bgcolor: "white",
                    color: theme.palette.primary.dark,
                    border: "3px solid white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {userData.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {userData.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Member since {userData.createdAt}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                p: { xs: 3, md: 4 },
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <IconButton
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <PersonIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Personal Information
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: "8px" },
                  }}
                />

                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: "8px" },
                  }}
                />
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                p: { xs: 3, md: 4 },
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <IconButton
                  sx={{
                    background: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                  }}
                >
                  <SecurityIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security
                </Typography>
              </Box>

              <TextField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={!isEditing}
                fullWidth
                variant="outlined"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  sx: { borderRadius: "8px" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        aria-label="toggle password visibility"
                        disabled={!isEditing}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}{" "}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {!isEditing && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Password last changed 30 days ago
                </Typography>
              )}
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<EditIcon />}
                  onClick={handleUpdateClick}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #1a237e, #d32f2f)",
                    boxShadow: "0 4px 10px rgba(211, 47, 47, 0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 12px rgba(211, 47, 47, 0.4)",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#d32f2f",
                      color: "#d32f2f",
                      "&:hover": {
                        borderColor: "#b71c1c",
                        bgcolor: alpha("#d32f2f", 0.04),
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<SaveIcon />}
                    onClick={handleSaveChanges}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #1a237e, #d32f2f)",
                      boxShadow: "0 4px 10px rgba(211, 47, 47, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 12px rgba(211, 47, 47, 0.4)",
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      </Container>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default Settings;
