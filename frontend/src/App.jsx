import React, { useState } from "react";
import { motion } from "framer-motion";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [location, setLocation] = useState(null);

  const handleClick = () => {
    if (isAnimating) return; // Prevent multiple clicks

    setIsAnimating(true);

    setTimeout(() => {
      if (!navigator.geolocation) {
        setIsAnimating(false);
        toast.warn("⚠️ Geolocation not supported.", {
          style: { background: "#ff9800", color: "#fff", borderRadius: "15px" },
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setLocation(newLocation);
          console.log(newLocation); // Log newLocation instead of location

          setIsAnimating(false);
          toast.success("📍 Location fetched!", {
            style: {
              background: "#1f7a1f",
              color: "#fff",
              borderRadius: "15px",
            },
          });
        },
        (error) => {
          setIsAnimating(false);
          toast.error(`❌ ${error.message}`, {
            style: {
              background: "#8b0000",
              color: "#fff",
              borderRadius: "15px",
            },
          });
        }
      );
    }, 3000);
  };

  const circleVariants = {
    initial: { scale: 1, boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.5)" },
    animate: {
      scale: [1, 1.2, 1],
      boxShadow: [
        "0 0 0 0 rgba(255, 255, 255, 0.5)",
        "0 0 20vmin 15vmin rgba(255, 255, 255, 0.3)",
        "0 0 40vmin 30vmin rgba(255, 255, 255, 0)",
      ],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    },
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
        variants={circleVariants}
        initial="initial"
        animate={isAnimating ? "animate" : "initial"}
      >
        <LocationOnIcon sx={{ color: "white", fontSize: "48px" }} />
      </motion.div>

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar
      />
    </div>
  );
};

export default App;
