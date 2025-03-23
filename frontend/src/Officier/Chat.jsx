import React, { useState, useEffect } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { motion } from "framer-motion";
import io from "socket.io-client";

// Socket.IO connection
const socket = io("http://localhost:5000"); // Replace with your server URL

const Chat = ({ victimId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Get officer ID from session storage
  const officerId = sessionStorage.getItem("oID");
  const chatId = `${officerId}_${victimId}`; // Unique chat ID combining officer and victim IDs

  // Join the chat room when the component mounts
  useEffect(() => {
    socket.emit("joinChat", chatId);

    // Listen for previous messages
    socket.on("previousMessages", (messages) => {
      setMessages(messages);
    });

    // Listen for new messages
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("previousMessages");
      socket.off("newMessage");
      socket.disconnect(); // Disconnect the socket when the component unmounts
    };
  }, [chatId]);

  // Send a new message
  const handleSend = () => {
    if (input.trim()) {
      // Emit the message to the server
      socket.emit("sendMessage", { chatId, sender: "officer", message: input });

      // Clear the input field
      setInput("");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "#f5f5f5",
          borderRadius: 2,
          gap: 2,
        }}
      >
        {messages
          .filter(
            (msg) =>
              msg.text && typeof msg.text === "string" && msg.text.trim() !== ""
          ) // Safely filter out empty messages
          .map((msg, index) => (
            <motion.div
              key={index} // Use index as a fallback
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{ mb: 1, color: "#333" }}
            >
              <strong>{msg.sender}: </strong>
              {msg.text}
            </motion.div>
          ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1, p: 2 }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          size="small"
          fullWidth
          variant="outlined"
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />
        <IconButton onClick={handleSend} color="primary" size="small">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
