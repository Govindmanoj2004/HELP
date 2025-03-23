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
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Person, Email, Lock, AssignmentInd } from "@mui/icons-material";

const colors = {
  primary: "#3b82f6",
  secondary: "#f43f5e",
  background: "#f1f5f9",
  card: "#ffffff",
  text: "#0f172a",
  lightText: "#64748b",
  accent: "#8b5cf6",
  white: "#fff",
  divider: "#e2e8f0",
  gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
};

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "victim",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    // Clear errors when the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = { name: "", email: "", password: "" };
    let isValid = true;

    // Name Validation
    if (!user.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(user.name)) {
      newErrors.name = "Name should contain only letters and spaces";
      isValid = false;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(user.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password Validation
    if (!user.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (user.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      let endpoint;
      let payload;

      switch (user.role) {
        case "victim":
          endpoint = "/victim/register";
          payload = user;
          break;
        case "officer":
          endpoint = "/officer/register";
          payload = user;
          break;
        case "counsellor":
          endpoint = "/counsellorReg";
          payload = {
            name: user.name,
            email: user.email,
            password: user.password,
          };
          break;
        default:
          throw new Error("Invalid role");
      }

      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (res.data.success) {
        navigate("/login");
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Registration failed");
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
              Create Account
            </Typography>
            <Typography
              variant="subtitle1"
              color={colors.lightText}
              gutterBottom
              sx={{ mb: 3 }}
            >
              Register as a Victim, Officer, or Counsellor
            </Typography>
          </motion.div>

          {submitError && (
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
                  {submitError}
                </Typography>
              </Box>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                value={user.name}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: colors.primary }} />
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
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                value={user.email}
                error={!!errors.email}
                helperText={errors.email}
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
                fullWidth
                value={user.password}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="new-password"
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
                label="Register as"
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
                Create Account
              </Button>
            </Stack>
          </form>

          {/* Login Link */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Typography variant="body2" sx={{ color: colors.lightText }}>
              Already have an account?{" "}
              <Link
                href="/login"
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
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Register;
