import { useState } from "react";
import { TextField, Button, Container, Typography, Box, MenuItem, Stack, InputAdornment } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Email, Lock, AssignmentInd } from "@mui/icons-material";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "", role: "victim" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = user.role === "victim" ? "/victim/login" : "/officer/login";
      const res = await axios.post(`http://localhost:5000${endpoint}`, user);

      if (res.data.success) {
        if (user.role === "victim") {
          // alert("Welcome to Victim Dashboard!"); // Redirect Victim
          navigate("/user/home");
        } else {
          // alert("Welcome to Officer Dashboard!"); // Redirect Officer
          navigate("/officer/home");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="md" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box
          sx={{
            p: 4,
            boxShadow: 3,
            borderRadius: 3,
            textAlign: "center",
            bgcolor: "#fafafa",
            width: "100%", // Wider form
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="#c62828" gutterBottom>
            Login
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Sign in as a Victim or Officer
          </Typography>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
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
                      <Email sx={{ color: "#c62828" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: "#757575", // Default label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#c62828", // Active label color
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c62828", // Active input border color
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
                      <Lock sx={{ color: "#c62828" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: "#757575", // Default label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#c62828", // Active label color
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c62828", // Active input border color
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
                      <AssignmentInd sx={{ color: "#c62828" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: "#757575", // Default label color
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#c62828", // Active label color
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c62828", // Active input border color
                  },
                }}
              >
                <MenuItem value="victim">Victim</MenuItem>
                <MenuItem value="officer">Officer</MenuItem>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: "16px",
                  backgroundColor: "#c62828",
                  "&:hover": { backgroundColor: "#b71c1c" },
                  borderRadius: 2,
                }}
              >
                Login
              </Button>
            </Stack>
          </form>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;