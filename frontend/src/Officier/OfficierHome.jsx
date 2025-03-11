import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Modal, Box, Typography, Button } from "@mui/material";

const socket = io("http://localhost:5000");

const OfficierHome = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  //update status
  const releaseHelpRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/helprequest/release",
        {
          requestId: selectedRequest._id,
        }
      );

      console.log("✅ Help request released:", response.data);

      // Update the help requests list
      setHelpRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, assignedOfficerId: null, status: "pending" }
            : req
        )
      );

      setSelectedRequest(null);
      setOpenModal(false);
    } catch (error) {
      console.error(
        "❌ Error releasing request:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
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

    fetchHelpRequests();

    // Listen for real-time updates
    socket.on("newHelpRequest", (newRequest) => {
      setHelpRequests((prevRequests) => [...prevRequests, newRequest]);
    });

    socket.on("updateHelpRequest", ({ requestId, status, officerId }) => {
      setHelpRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId
            ? { ...request, status, assignedOfficerId: officerId }
            : request
        )
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

      if (!officerId) {
        console.error("No officer ID found in sessionStorage");
        return;
      }

      console.log("Sending Accept Request:", { requestId, officerId });

      const response = await axios.post(
        "http://localhost:5000/helprequest/accept",
        {
          requestId,
          officerId,
        }
      );

      console.log("Accepted Help Request:", response.data);

      // Find the selected request
      const request = helpRequests.find((req) => req._id === requestId);
      setSelectedRequest(request);

      // Open Modal
      setOpenModal(true);
    } catch (error) {
      console.error(
        "Error accepting request:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) return <p>Loading help requests...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="officier-home">
      <h1>Active Help Requests</h1>
      {helpRequests.length > 0 ? (
        helpRequests.map((request, index) => {
          const { location } = request || {}; // Ensure request exists
          const latitude = location?.latitude ?? "N/A"; // Avoid crash
          const longitude = location?.longitude ?? "N/A"; // Avoid crash

          return (
            <div key={index} className="help-request-card">
              <p>Victim: {request.victimId?.name || "Unknown"}</p>
              <p>Latitude: {latitude}</p>
              <p>Longitude: {longitude}</p>
              <button onClick={() => acceptHelpRequest(request._id)}>
                Accept
              </button>
            </div>
          );
        })
      ) : (
        <p>No active help requests</p>
      )}

      {/* MODAL */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Help Request Details
          </Typography>

          {selectedRequest && (
            <>
              <Typography variant="body1" mt={2}>
                <strong>Victim:</strong>{" "}
                {selectedRequest.victimId?.name || "Unknown"}
              </Typography>
              <Typography variant="body1">
                <strong>Latitude:</strong>{" "}
                {selectedRequest.location?.latitude || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Longitude:</strong>{" "}
                {selectedRequest.location?.longitude || "N/A"}
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  border: "1px solid #ccc",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Chat (Coming Soon)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A secure chat will be available here in the future.
                </Typography>
              </Box>
            </>
          )}

          <Button
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "#c62828",
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
            onClick={releaseHelpRequest} // Call the function here
          >
            Disconnect
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default OfficierHome;
