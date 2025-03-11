import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


const socket = io("http://localhost:5000");

const victimId = sessionStorage.getItem("uID");
console.log("Victim ID:", victimId);

const UserHome = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [officerName, setOfficerName] = useState("");
  const [activeRequest, setActiveRequest] = useState(false);

  useEffect(() => {
    const handleHelpRequestAccepted = async ({ requestId, officerId }) => {
      setActiveRequest(true);
      setIsAnimating(false);
      setIsChatOpen(true);

      toast.info(`🚔 Officer is responding to your request!`, {
        style: { background: "#1565c0", color: "#fff", borderRadius: "15px" },
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
          style: { background: "#ff9800", color: "#fff", borderRadius: "15px" },
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
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      if (!navigator.geolocation) {
        setIsAnimating(false);
        toast.warn("⚠️ Geolocation not supported.");
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
            toast.success("📍 Help request sent!");
            setActiveRequest(true);
          } catch (error) {
            console.error("❌ Failed to send help request:", error);
            toast.error("❌ Failed to send help request.");
          }
        },
        (error) => {
          setIsAnimating(false);
          console.error("❌ Geolocation error:", error);
          toast.error(`❌ ${error.message}`);
        }
      );
    }, 3000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #d90429, #1d1d1d)",
      }}
    >
      <motion.div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          background: "#d90429",
          boxShadow: "0 8px 16px rgba(217, 4, 41, 0.4)",
        }}
        onClick={handleClick}
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      >
        <LocationOnIcon sx={{ color: "white", fontSize: "48px" }} />
      </motion.div>

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar
      />

      {/* Chat Modal */}
      <Dialog
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
          transition: { duration: 0.3 },
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            maxWidth: "400px",
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
            Chat with Officer
          </DialogTitle>
          <IconButton
            onClick={() => setIsChatOpen(false)}
            sx={{ color: "gray" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
            Officer <strong>{officerName}</strong> is now assisting you.
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHome;
