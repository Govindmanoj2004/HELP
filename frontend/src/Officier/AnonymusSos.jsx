import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { LocationOn, ArrowBack, WarningAmber, Margin } from "@mui/icons-material";
import Lottie from "lottie-react";
import animationData from "./../lottie/Animation - 1742619584984.json";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Color palette
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
  success: "#10b981",
  warning: "#f59e0b",
  lightBackground: "#f8fafc",
};

const AnonymusSos = () => {
  // State management
  const [anonymousRequests, setAnonymousRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs and hooks
  const lottieRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // API calls
  const fetchAnonymousRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/anonymusSos");
      setAnonymousRequests(response.data || []);
    } catch (err) {
      setError("Failed to fetch anonymous SOS requests.");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchAnonymousRequests();
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  // Event handlers
  const toggleAnimation = () => {
    if (lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.pause();
      } else {
        lottieRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // UI Components
  const renderHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 5,
          pb: 3,
          borderBottom: `1px solid ${colors.divider}`,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{
              background: colors.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Anonymous SOS Requests
          </Typography>
          <Typography
            variant="subtitle1"
            color={colors.lightText}
            sx={{ mt: 1 }}
          >
            View all anonymous emergency requests
          </Typography>
        </Box>

        <Box
          sx={{
            width: "100px",
            height: "100px",
            cursor: "pointer",
          }}
          onClick={toggleAnimation}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={false}
          />
        </Box>
      </Box>
    </motion.div>
  );

  const renderNavigation = () => (
    <Box sx={{ textAlign: "right", mb: 3 }}>
      <IconButton
        component={Link}
        to="/officer/home"
        sx={{
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          margin: 1,
          borderRadius: 2,
          p: 1.5,
          "&:hover": {
            backgroundColor: "rgba(59, 130, 246, 0.2)",
          },
        }}
      >
        <ArrowBack sx={{ color: colors.primary }} />
      </IconButton>
      <IconButton
        component={Link}
        to="/officer/settings"
        sx={{
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: 2,
          p: 1.5,
          "&:hover": {
            backgroundColor: "rgba(59, 130, 246, 0.2)",
          },
        }}
      >
        <AccountCircleIcon sx={{ color: colors.primary }} />
      </IconButton>
    </Box>
  );

  const renderLoading = () => (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "300px" }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{ color: colors.primary }}
      />
    </Box>
  );

  const renderError = () => (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "rgba(244, 63, 94, 0.1)",
        border: `1px solid ${colors.secondary}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "600px",
        mx: "auto",
        minHeight: "200px",
      }}
    >
      <WarningAmber sx={{ color: colors.secondary, mr: 2, fontSize: "2rem" }} />
      <Typography color={colors.secondary}>{error}</Typography>
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        backgroundColor: colors.lightBackground,
        borderRadius: 4,
        border: `1px dashed ${colors.divider}`,
        maxWidth: "700px",
        mx: "auto",
      }}
    >
      <Typography
        variant="h6"
        color={colors.lightText}
        fontWeight={500}
        gutterBottom
      >
        No anonymous SOS requests found
      </Typography>
      <Typography variant="body2" color={colors.lightText}>
        New requests will appear here automatically when they come in
      </Typography>
    </Box>
  );

  const renderRequestCard = (request, index) => (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <motion.div
        whileHover={{
          y: -5,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${colors.divider}`,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.card,
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 2, flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: colors.primary,
                  width: 45,
                  height: 45,
                  mr: 2,
                }}
              >
                <LocationOn sx={{ color: colors.white }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Anonymous Request
                </Typography>
                <Typography variant="caption" color={colors.lightText}>
                  Request ID: {request._id?.substring(0, 6) || "N/A"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <LocationOn
                sx={{
                  color: colors.secondary,
                  mr: 1,
                  fontSize: "1.2rem",
                }}
              />
              <Typography variant="body2" color={colors.text}>
                {request.location?.latitude || "N/A"},{" "}
                {request.location?.longitude || "N/A"}
              </Typography>
            </Box>

            <Typography variant="caption" color={colors.lightText}>
              Timestamp: {new Date(request.timestamp).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );

  const renderRequestsList = () => (
    <Grid container spacing={3} justifyContent="center">
      {anonymousRequests.map((request, index) =>
        renderRequestCard(request, index)
      )}
    </Grid>
  );

  // Main render
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        {renderNavigation()}
        {renderHeader()}

        {loading
          ? renderLoading()
          : error
          ? renderError()
          : anonymousRequests.length > 0
          ? renderRequestsList()
          : renderEmptyState()}
      </Container>
    </Box>
  );
};

export default AnonymusSos;
