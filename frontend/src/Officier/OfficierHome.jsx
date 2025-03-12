import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Container, 
  Grid,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
import { 
  LocationOn, 
  Person, 
  Forum, 
  Close,
  Refresh,
  WarningAmber
} from "@mui/icons-material";

const socket = io("http://localhost:5000");

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
  success: "#10b981", // Green for success states
  warning: "#f59e0b", // Amber for warnings
  lightBackground: "#f8fafc", // Very light background for containers
};

const OfficerHome = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchHelpRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/helprequests");
      setHelpRequests(response.data.requests || []);
    } catch (err) {
      setError("Failed to fetch help requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpRequests();
    socket.on("newHelpRequest", (newRequest) => setHelpRequests((prev) => [...prev, newRequest]));
    socket.on("updateHelpRequest", ({ requestId, status, officerId }) => {
      setHelpRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status, assignedOfficerId: officerId } : req))
      );
    });
    return () => {
      socket.off("newHelpRequest");
      socket.off("updateHelpRequest");
    };
  }, []);

  const acceptHelpRequest = async (requestId) => {
    try {
      const officerId = sessionStorage.getItem("oID");
      if (!officerId) return;
      await axios.post("http://localhost:5000/helprequest/accept", { requestId, officerId });
      setSelectedRequest(helpRequests.find((req) => req._id === requestId));
      setOpenModal(true);
    } catch (error) {
      console.error("Error accepting request:", error.response?.data || error.message);
    }
  };

  const releaseHelpRequest = async () => {
    if (!selectedRequest) return;
    try {
      await axios.post("http://localhost:5000/helprequest/release", { requestId: selectedRequest._id });
      socket.emit("officerClosedChat", { requestId: selectedRequest._id });
      closeModalAndRefresh();
    } catch (error) {
      console.error("Error releasing request:", error.response?.data || error.message);
    }
  };

  const closeModalAndRefresh = () => {
    setOpenModal(false);
    setSelectedRequest(null);
    fetchHelpRequests();
  };

  // Function to get the first letter of name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      backgroundColor: colors.background,
      pt: 4,
      pb: 8
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            textAlign: "center", 
            mb: 5, 
            pb: 3,
            borderBottom: `1px solid ${colors.divider}`
          }}>
            <Typography 
              variant="h4" 
              fontWeight="700" 
              sx={{
                background: colors.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Active Help Requests
            </Typography>
            <Typography 
              variant="subtitle1" 
              color={colors.lightText} 
              sx={{ mt: 1 }}
            >
              Officer Dashboard
            </Typography>
          </Box>
        </motion.div>

        {loading ? (
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
        ) : error ? (
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
              minHeight: "200px"
            }}
          >
            <WarningAmber sx={{ color: colors.secondary, mr: 2, fontSize: "2rem" }} />
            <Typography color={colors.secondary}>{error}</Typography>
          </Box>
        ) : (
          <>
            {/* Refresh button */}
            <Box sx={{ textAlign: "right", mb: 3 }}>
              <Button 
                startIcon={<Refresh />}
                onClick={fetchHelpRequests}
                sx={{
                  color: colors.primary,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: 2,
                  px: 2,
                  "&:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
            
            {helpRequests.filter((req) => req.status === "pending").length > 0 ? (
              <Grid container spacing={3} justifyContent="center">
                {helpRequests
                  .filter((req) => req.status === "pending")
                  .map((req, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} 
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
                                  mr: 2
                                }}
                              >
                                {getInitial(req.victimId?.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight={600}>
                                  {req.victimId?.name || "Unknown Victim"}
                                </Typography>
                                <Typography variant="caption" color={colors.lightText}>
                                  Request ID: {req._id?.substring(0, 6) || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <LocationOn sx={{ color: colors.secondary, mr: 1, fontSize: "1.2rem" }} />
                              <Typography variant="body2" color={colors.text}>
                                {req.location?.latitude || "N/A"}, {req.location?.longitude || "N/A"}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 3 }}>
                              <Button
                                variant="contained"
                                fullWidth
                                sx={{ 
                                  py: 1.2,
                                  background: colors.gradient,
                                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontSize: "15px",
                                  fontWeight: 600,
                                  "&:hover": { 
                                    background: colors.gradient,
                                    boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                                  },
                                }}
                                onClick={() => acceptHelpRequest(req._id)}
                              >
                                Accept Request
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))
                }
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  textAlign: "center", 
                  py: 8,
                  backgroundColor: colors.lightBackground,
                  borderRadius: 4,
                  border: `1px dashed ${colors.divider}`,
                  maxWidth: "700px",
                  mx: "auto"
                }}
              >
                <Typography variant="h6" color={colors.lightText} fontWeight={500} gutterBottom>
                  No active help requests at the moment
                </Typography>
                <Typography variant="body2" color={colors.lightText}>
                  New requests will appear here automatically when they come in
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Modal */}
        <Modal 
          open={openModal} 
          onClose={closeModalAndRefresh}
          aria-labelledby="help-request-modal"
          aria-describedby="detailed-view-of-help-request"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "90%" : 500,
              bgcolor: colors.card,
              boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
              p: 4,
              borderRadius: 4,
              outline: "none",
              border: `1px solid ${colors.divider}`,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" fontWeight="700" id="help-request-modal">
                Help Request Details
              </Typography>
              <Button 
                sx={{ minWidth: 'auto', p: 1, color: colors.lightText }}
                onClick={closeModalAndRefresh}
              >
                <Close />
              </Button>
            </Box>
            
            {selectedRequest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: colors.primary,
                      width: 55,
                      height: 55,
                      mr: 2
                    }}
                  >
                    {getInitial(selectedRequest.victimId?.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedRequest.victimId?.name || "Unknown"}
                    </Typography>
                    <Typography variant="body2" color={colors.lightText}>
                      Victim ID: {selectedRequest.victimId?._id?.substring(0, 8) || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color={colors.lightText} gutterBottom>
                  Location Details
                </Typography>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: colors.lightBackground,
                    border: `1px solid ${colors.divider}`,
                    mb: 3
                  }}
                >
                  <Box sx={{ display: "flex", mb: 1 }}>
                    <Typography variant="body2" color={colors.text} sx={{ mr: 1, fontWeight: 600, width: "80px" }}>
                      Latitude:
                    </Typography>
                    <Typography variant="body2" color={colors.text}>
                      {selectedRequest.location?.latitude || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex" }}>
                    <Typography variant="body2" color={colors.text} sx={{ mr: 1, fontWeight: 600, width: "80px" }}>
                      Longitude:
                    </Typography>
                    <Typography variant="body2" color={colors.text}>
                      {selectedRequest.location?.longitude || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 3, 
                    backgroundColor: colors.lightBackground, 
                    borderRadius: 3, 
                    border: `1px solid ${colors.divider}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3
                  }}
                >
                  <Forum sx={{ color: colors.accent, fontSize: "2rem", mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Chat Feature Coming Soon
                  </Typography>
                  <Typography variant="body2" color={colors.lightText} textAlign="center">
                    A secure communication system will be available here in a future update.
                  </Typography>
                </Box>
              </motion.div>
            )}
            
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                startIcon={<Close />}
                sx={{ 
                  py: 1.2,
                  px: 3,
                  backgroundColor: colors.secondary,
                  "&:hover": { backgroundColor: "#e11d48" },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={releaseHelpRequest}
              >
                End Connection
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default OfficerHome;