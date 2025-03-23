import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SosIcon from "@mui/icons-material/ReportProblem";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedIcon from "@mui/icons-material/Verified";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";
import NightShelterIcon from "@mui/icons-material/NightShelter";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";

// Initialize socket connection
const socket = io("http://localhost:5000");
const victimId = sessionStorage.getItem("uID");

const UserHome = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [officerName, setOfficerName] = useState("");
  const [activeRequest, setActiveRequest] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [OfficerId, setOfficerId] = useState(); // Officer ID

  useEffect(() => {
    // Notify the server that the victim has connected
    if (victimId) {
      socket.emit("victimConnected", victimId);
    }

    const handleHelpRequestAccepted = async ({ requestId, officerId }) => {
      setOfficerId(officerId);
      setActiveRequest(true);
      setIsAnimating(false);
      setLoading(false);
      setIsChatOpen(true);

      toast.info(`🚔 Officer is responding to your request!`, {
        style: {
          background: "#3f51b5",
          color: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(63, 81, 181, 0.3)",
        },
      });

      try {
        const res = await axios.get(
          `http://localhost:5000/officer/${officerId}`
        );
        setOfficerName(res.data.name);
      } catch (err) {
        setOfficerName("Unknown Officer");
      }
    };

    const handleHelpRequestResolved = ({ requestId }) => {
      if (activeRequest) {
        toast.success("✅ Your request has been resolved!", {
          autoClose: 3000,
          style: {
            background: "#4caf50",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
          },
        });
      }
      setIsChatOpen(false);
      setActiveRequest(false);
    };

    const handleOfficerClosedChat = ({ message }) => {
      console.log("🚪 Officer disconnected:", message);
      if (activeRequest) {
        toast.warning("🚨 Officer has disconnected!", {
          autoClose: 3000,
          style: {
            background: "#ff9800",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
          },
        });
      }
      setIsChatOpen(false);
      setActiveRequest(false);
    };

    socket.on("helpRequestAccepted", handleHelpRequestAccepted);
    socket.on("helpRequestResolved", handleHelpRequestResolved);
    socket.on("officerClosedChat", handleOfficerClosedChat);

    return () => {
      socket.off("helpRequestAccepted", handleHelpRequestAccepted);
      socket.off("helpRequestResolved", handleHelpRequestResolved);
      socket.off("officerClosedChat", handleOfficerClosedChat);
    };
  }, [activeRequest]);

  const handleClick = async () => {
    if (isAnimating || activeRequest) return;

    setIsAnimating(true);
    setLoading(true);

    setTimeout(() => {
      if (!navigator.geolocation) {
        setIsAnimating(false);
        setLoading(false);
        toast.warn("⚠️ Geolocation not supported.", {
          style: {
            background: "#ff9800",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
          },
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            victimId,
          };

          try {
            await axios.post("http://localhost:5000/helprequest", newLocation);
            console.log("📍 Help request sent:", newLocation);
            toast.success(
              "📍 Help request sent! Awaiting officer response...",
              {
                style: {
                  background: "#4caf50",
                  color: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                },
              }
            );
            setActiveRequest(true);
            // Keep the loading state active until an officer responds
          } catch (error) {
            console.error("❌ Failed to send help request:", error);
            toast.error("❌ Failed to send help request.", {
              style: {
                background: "#f44336",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
              },
            });
            setIsAnimating(false);
            setLoading(false);
          }
        },
        (error) => {
          setIsAnimating(false);
          setLoading(false);
          console.error("❌ Geolocation error:", error);
          toast.error(`❌ ${error.message}`, {
            style: {
              background: "#f44336",
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
            },
          });
        }
      );
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a237e, #d32f2f)",
        fontFamily: "'Roboto', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <IconButton
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
        onClick={() => {
          navigate("/user/settings"); // Navigate to the settings page
        }}
      >
        <SettingsIcon />
      </IconButton>

      <IconButton
        sx={{
          position: "absolute",
          top: 16,
          right: 80,
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
        onClick={() => {
          navigate("/user/shelters"); // Navigate to the settings page
        }}
      >
        <NightShelterIcon />
      </IconButton>

      <IconButton
        sx={{
          position: "absolute",
          top: 16,
          right: 150,
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
        onClick={() => {
          navigate("/user/counsellor"); // Navigate to the settings page
        }}
      >
        <PsychologyAltIcon />
      </IconButton>

      {/* Background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        }}
      />

      {/* App title */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: "white",
          marginBottom: 4,
          fontWeight: 700,
          textShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        Emergency Response
      </Typography>

      {/* Status indicator */}
      <Chip
        label={activeRequest ? "Help request active" : "Ready for emergency"}
        color={activeRequest ? "error" : "success"}
        icon={activeRequest ? <SosIcon /> : <VerifiedIcon />}
        sx={{
          marginBottom: 6,
          padding: "8px 12px",
          height: "auto",
          fontSize: "1rem",
          mb: 10,
          fontWeight: 500,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      />

      {/* Main button */}
      <motion.div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: activeRequest ? "default" : "pointer",
          background: activeRequest ? "#9e9e9e" : "#d32f2f",
          boxShadow:
            "0 8px 30px rgba(211, 47, 47, 0.6), inset 0 -2px 10px rgba(0,0,0,0.2)",
          position: "relative",
        }}
        onClick={handleClick}
        whileHover={!activeRequest ? { scale: 1.05 } : {}}
        whileTap={!activeRequest ? { scale: 0.95 } : {}}
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
        transition={{
          duration: 1.5,
          repeat: isAnimating ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {loading ? (
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size={80} thickness={4} sx={{ color: "white" }} />
            <Typography
              variant="h6"
              sx={{
                position: "absolute",
                color: "white",
                fontWeight: 600,
              }}
            >
              SOS
            </Typography>
          </Box>
        ) : (
          <>
            <LocationOnIcon sx={{ color: "white", fontSize: "64px" }} />
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [1, 2, 3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: activeRequest
                  ? "transparent"
                  : "rgba(211, 47, 47, 0.3)",
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </motion.div>

      <Typography
        variant="body1"
        sx={{
          color: "rgba(255,255,255,0.8)",
          marginTop: 5,
          maxWidth: "80%",
          textAlign: "center",
          padding: 2,
          borderRadius: 2,
          mt: 15,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
      >
        {activeRequest
          ? "Your emergency request has been sent. Please wait for an officer to respond."
          : "Press the emergency button to send your location and request immediate assistance."}
      </Typography>

      {/* Toast notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Officer chat dialog */}
      <AnimatePresence>
        {isChatOpen && (
          <Dialog
            open={isChatOpen}
            onClose={() => {}}
            PaperProps={{
              component: motion.div,
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 20 },
              transition: { duration: 0.3, ease: "easeInOut" },
              sx: {
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                p: 0,
                maxWidth: "400px",
                overflow: "hidden",
              },
            }}
          >
            <Box
              sx={{
                backgroundColor: "#1a237e",
                color: "white",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: "#3f51b5",
                    width: 48,
                    height: 48,
                    border: "2px solid white",
                  }}
                >
                  {officerName.charAt(0)}
                </Avatar>
                <Box>
                  <DialogTitle
                    sx={{ padding: 0, fontWeight: "bold", fontSize: "1.2rem" }}
                  >
                    Officer Connected
                  </DialogTitle>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Police Emergency Line
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => setIsChatOpen(false)}
                sx={{ color: "white" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ padding: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  padding: 2,
                  backgroundColor: "rgba(63, 81, 181, 0.1)",
                  borderRadius: 2,
                  border: "1px solid rgba(63, 81, 181, 0.2)",
                  marginBottom: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  <strong>Status:</strong> Active Response
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  <strong>Officer:</strong> {officerName}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  <strong>Request ID:</strong> #
                  {Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}
                </Typography>
              </Paper>

              <Typography
                variant="body1"
                sx={{
                  padding: 2,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  color: "#424242",
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                Officer <strong>{officerName}</strong> is now assisting you.
                Please provide details about your emergency situation.
              </Typography>

              {/* Chat input placeholder */}
              <Chat officerId={OfficerId} />
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserHome;
