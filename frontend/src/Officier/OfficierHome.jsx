import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Modal, Box, Typography, Button, Card, CardContent, CircularProgress, Container, Grid } from "@mui/material";
import { m, motion } from "framer-motion";

const socket = io("http://localhost:5000");

const OfficerHome = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom sx={{mb: 5}}>
        Active Help Requests
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">{error}</Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {helpRequests.filter((req) => req.status === "pending").length > 0 ? (
            helpRequests
              .filter((req) => req.status === "pending")
              .map((req, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6">Victim: {req.victimId?.name || "Unknown"}</Typography>
                        <Typography variant="body2">Latitude: {req.location?.latitude || "N/A"}</Typography>
                        <Typography variant="body2">Longitude: {req.location?.longitude || "N/A"}</Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => acceptHelpRequest(req._id)}
                        >
                          Accept
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))
          ) : (
            <Typography textAlign="center">No active help requests</Typography>
          )}
        </Grid>
      )}

      {/* Modal */}
      <Modal open={openModal} onClose={closeModalAndRefresh}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">Help Request Details</Typography>
          {selectedRequest && (
            <>
              <Typography variant="body1" mt={2}><strong>Victim:</strong> {selectedRequest.victimId?.name || "Unknown"}</Typography>
              <Typography variant="body1"><strong>Latitude:</strong> {selectedRequest.location?.latitude || "N/A"}</Typography>
              <Typography variant="body1"><strong>Longitude:</strong> {selectedRequest.location?.longitude || "N/A"}</Typography>
              <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1, border: "1px solid #ccc" }}>
                <Typography variant="subtitle1" fontWeight="bold">Chat (Coming Soon)</Typography>
                <Typography variant="body2" color="text.secondary">A secure chat will be available here in the future.</Typography>
              </Box>
            </>
          )}
          <Button
            variant="contained"
            sx={{ mt: 3, backgroundColor: "#c62828", "&:hover": { backgroundColor: "#b71c1c" } }}
            onClick={releaseHelpRequest}
          >
            Disconnect
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default OfficerHome;