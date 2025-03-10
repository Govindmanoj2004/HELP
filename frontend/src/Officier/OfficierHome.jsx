import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  List,
  ListItem,
} from "@mui/material";
import { motion } from "framer-motion";

const socket = io("http://localhost:5000");

const OfficierHome = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const officerId = "67cde7e5f2df496a93879e4c"; //replace id with session(session work pending ahhh)

  // Fetch help requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/helprequests");
        setHelpRequests(response.data.requests);
      } catch (error) {
        console.error("Error fetching help requests:", error);
      }
    };

    fetchRequests();

    socket.on("newHelpRequest", (newRequest) => {
      setHelpRequests((prev) => [...prev, newRequest]);
    });

    socket.on("helpRequestAccepted", ({ requestId }) => {
      setHelpRequests((prev) => prev.filter((req) => req._id !== requestId));
    });

    socket.on("helpRequestReleased", ({ requestId }) => {
      if (currentRequest && currentRequest._id === requestId) {
        setCurrentRequest(null);
      }
    });

    return () => {
      socket.off("newHelpRequest");
      socket.off("helpRequestAccepted");
      socket.off("helpRequestReleased");
    };
  }, [currentRequest]);

  // Accept Help Request
  const acceptRequest = async (requestId) => {
    if (currentRequest) {
      alert("You are already handling a request!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/helprequest/accept",
        {
          requestId,
          officerId,
        }
      );

      setCurrentRequest(response.data.request);
      setHelpRequests((prev) => prev.filter((req) => req._id !== requestId));

      socket.emit("helpRequestAccepted", { requestId, officerId });

      alert("Request accepted successfully!");
    } catch (error) {
      console.error(
        "Error accepting request:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  const releaseRequest = async () => {
    if (!currentRequest) return;

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/helprequest/release", {
        requestId: currentRequest._id,
      });

      setCurrentRequest(null);
      alert("Disconnected from victim.");
    } catch (error) {
      console.error(
        "Error disconnecting:",
        error.response?.data || error.message
      );
      alert("Failed to disconnect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3} color="primary">
          Officer Dashboard
        </Typography>
      </motion.div>

      {currentRequest ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ backgroundColor: "#ffebee", p: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" color="error">
                Currently Assisting:
              </Typography>
              <Typography>
                <strong>Victim:</strong>{" "}
                {currentRequest.victimId?.name || "Unknown"}
              </Typography>
              <Typography>
                <strong>Location:</strong> ({currentRequest.location.latitude},{" "}
                {currentRequest.location.longitude})
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={releaseRequest}
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Disconnect"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {helpRequests.length === 0 ? (
            <Typography>No pending requests</Typography>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                color="secondary"
                mb={2}
              >
                Active Help Requests
              </Typography>
              <List>
                {helpRequests.map((request) => (
                  <motion.div key={request._id} whileHover={{ scale: 1.02 }}>
                    <ListItem>
                      <Card
                        sx={{
                          width: "100%",
                          p: 2,
                          borderRadius: "12px",
                          backgroundColor: "#f5f5f5",
                          boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                        }}
                      >
                        <CardContent>
                          <Typography>
                            <strong>Victim:</strong>{" "}
                            {request.victimId?.name || "Unknown"}
                          </Typography>
                          <Typography>
                            <strong>Location:</strong> (
                            {request.location.latitude},{" "}
                            {request.location.longitude})
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => acceptRequest(request._id)}
                            sx={{ mt: 2 }}
                            disabled={loading}
                          >
                            {loading ? (
                              <CircularProgress
                                size={24}
                                sx={{ color: "white" }}
                              />
                            ) : (
                              "Accept"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </motion.div>
          )}
        </>
      )}
    </Box>
  );
};

export default OfficierHome;
