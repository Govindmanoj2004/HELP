import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const socket = io("http://localhost:5000"); // Connect WebSocket

const victimId = "67cde7a8f2df496a93879e49"; // Victim's unique ID

const UserHome = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    socket.on("helpRequestAccepted", ({ requestId, officer }) => {
      toast.info(`🚔 Officer ${officer.name} accepted your request!`, {
        style: { background: "#1565c0", color: "#fff", borderRadius: "15px" },
      });
    });

    return () => {
      socket.off("helpRequestAccepted");
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

          setLocation(newLocation);

          try {
            await axios.post("http://localhost:5000/helprequest", newLocation);
            toast.success("📍 Help request sent!");
          } catch (error) {
            toast.error("❌ Failed to send help request.");
          }

          setIsAnimating(false);
        },
        (error) => {
          setIsAnimating(false);
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

      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default UserHome;
