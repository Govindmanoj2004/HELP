import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  MenuItem,
  Stack,
  InputAdornment,
  Link,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Email, Lock, AssignmentInd } from "@mui/icons-material";

// Enhanced Modern Color Palette
const colors = {
  primary: "#3b82f6", // Slightly lighter blue
  secondary: "#f43f5e", // Vibrant red for emergency/alert actions
  background: "#f1f5f9", // Light blue-gray background
  card: "#ffffff", // White card backgrounds
  text: "#0f172a", // Darker text for better contrast
  lightText: "#64748b", // Lighter text for secondary content
  accent: "#8b5cf6", // Purple accent
  white: "#fff", // Pure white
  divider: "#e2e8f0", // Light gray divider
  gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", // Blue to purple gradient
};

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "", role: "victim" });
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let endpoint;
      let payload;

      switch (user.role) {
        case "victim":
          endpoint = "/victim/login";
          payload = user;
          break;
        case "officer":
          endpoint = "/officer/login";
          payload = user;
          break;
        case "counsellor":
          endpoint = "/counsellorLogin";
          payload = { email: user.email, password: user.password };
          break;
        case "legalsupport":
          endpoint = "/legalLogin";
          payload = user;
          break;
        default:
          throw new Error("Invalid role");
      }

      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (res.data.success) {
        setSnackbarMessage("Login successful! Redirecting...");
        setOpenSnackbar(true);

        // Delay navigation slightly to allow the user to see the success message
        setTimeout(() => {
          switch (user.role) {
            case "victim":
              if (!res.data.user || !res.data.user.id) {
                setError("Login failed: User ID missing.");
                return;
              }
              sessionStorage.setItem("uID", res.data.user.id);
              navigate("/user/home");
              break;
            case "officer":
              if (!res.data.user || !res.data.user.id) {
                setError("Login failed: Officer ID missing.");
                return;
              }
              sessionStorage.setItem("oID", res.data.user.id);
              navigate("/officer/home");
              break;
            case "counsellor":
              if (!res.data.user || !res.data.user.id) {
                setError("Login failed: Counsellor ID missing.");
                return;
              }
              sessionStorage.setItem("cID", res.data.user.id);
              navigate("/counsellor/home");
              break;
            case "legalsupport":
              if (!res.data.user || !res.data.user.id) {
                setError("Login failed: legalsupport ID missing.");
                return;
              }
              sessionStorage.setItem("lID", res.data.user.id);
              navigate("/legalsupport/home");
              break;
            default:
              throw new Error("Invalid role");
          }
        }, 1500);
      } else {
        setError("Login failed: No success flag.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        paddingTop: isMobile ? 4 : 0,
        paddingBottom: isMobile ? 4 : 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "500px" }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 5 },
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            borderRadius: 4,
            textAlign: "center",
            bgcolor: colors.card,
            width: "100%",
            border: `1px solid ${colors.divider}`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{
                background: colors.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="subtitle1"
              color={colors.lightText}
              gutterBottom
              sx={{ mb: 3 }}
            >
              Sign in to your account
            </Typography>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "rgba(244, 63, 94, 0.1)",
                  border: `1px solid ${colors.secondary}`,
                }}
              >
                <Typography color={colors.secondary} variant="body2">
                  {error}
                </Typography>
              </Box>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: colors.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary,
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.primary,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: colors.primary,
                    },
                }}
                onChange={handleChange}
                required
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: colors.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary,
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.primary,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: colors.primary,
                    },
                }}
                onChange={handleChange}
                required
              />
              <TextField
                select
                label="Login as"
                name="role"
                fullWidth
                value={user.role}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentInd sx={{ color: colors.primary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary,
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.primary,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: colors.primary,
                    },
                }}
              >
                <MenuItem value="victim">Victim</MenuItem>
                <MenuItem value="officer">Officer</MenuItem>
                <MenuItem value="counsellor">Counsellor</MenuItem>
                <MenuItem value="legalsupport">Legalsupport</MenuItem>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: "16px",
                  fontWeight: "600",
                  background: colors.gradient,
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  "&:hover": {
                    background: colors.gradient,
                    boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                  },
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          {/* Register Link */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Typography variant="body2" sx={{ color: colors.lightText }}>
              Don't have an account?{" "}
              <Link
                href="/register"
                sx={{
                  color: colors.primary,
                  fontWeight: 600,
                  textDecoration: "none",
                  position: "relative",
                  "&:hover": {
                    textDecoration: "none",
                    "&:after": {
                      width: "100%",
                    },
                  },
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    width: "0%",
                    height: "2px",
                    backgroundColor: colors.primary,
                    transition: "width 0.3s ease",
                  },
                }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
