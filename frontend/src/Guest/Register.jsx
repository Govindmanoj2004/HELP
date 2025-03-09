import { useState } from "react";
import { TextField, Button, Container, Typography, Card, Stack, InputAdornment, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Person, Email, Lock, AssignmentInd } from "@mui/icons-material";

const Register = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "", role: "victim" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = user.role === "victim" ? "/victim/register" : "/officer/register";
      const res = await axios.post(`http://localhost:5000${endpoint}`, user);

      if (res.data.success) {
        navigate("/guest/login"); // Redirect to login page
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Container maxWidth="md" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card
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
            Register
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Create an account as a Victim or Officer
          </Typography>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <Stack spacing={3}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#c62828" }} />
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
                label="Email"
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
                autoComplete="new-password"
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
                label="Role"
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
                Create Account
              </Button>
            </Stack>
          </form>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Register;