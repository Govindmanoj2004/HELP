import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const socket = io("http://localhost:5000"); // WebSocket connection

const victimId = sessionStorage.getItem("uID");
console.log("Victim ID:", victimId);

const UserHome = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [officerName, setOfficerName] = useState("");

  useEffect(() => {
    socket.on("helpRequestAccepted", async ({ requestId, officerId }) => {
      console.log("🔵 helpRequestAccepted event received:", {
        requestId,
        officerId,
      });

      toast.info(`🚔 Officer is responding to your request!`, {
        style: { background: "#1565c0", color: "#fff", borderRadius: "15px" },
      });

      setIsAnimating(false);
      setIsChatOpen(true); // Open the chat first

      // Fetch officer details
      try {
        const res = await axios.get(
          `http://localhost:5000/officer/${officerId}`
        );
        console.log("✅ Officer data fetched:", res.data);
        setOfficerName(res.data.name);
      } catch (err) {
        console.error("❌ Error fetching officer details:", err);
        setOfficerName("Unknown Officer");
      }
    });

    socket.on("helpRequestResolved", ({ requestId }) => {
      console.log("🟢 helpRequestResolved event received:", { requestId });
      toast.success("✅ Your request has been resolved!");
      setIsChatOpen(false);
    });

    return () => {
      socket.off("helpRequestAccepted");
      socket.off("helpRequestResolved");
    };
  }, []);

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
      <Dialog open={isChatOpen} onClose={() => setIsChatOpen(false)}>
        <DialogTitle>Chat with Officer</DialogTitle>
        <DialogContent>
          <p>Officer {officerName} is now assisting you.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHome;
