import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  DoneAll as DoneAllIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import moment from "moment";
import axios from "axios";

const CounsellorHome = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    booked: 0,
    accepted: 0,
    resolved: 0,
  });

  const counsellorId = sessionStorage.getItem("cID");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/bookings/${counsellorId}`
      );
      const data = await response.json();
      setBookings(data);

      // Calculate statistics
      const newStats = {
        total: data.length,
        booked: data.filter((booking) => booking.status === "booked").length,
        accepted: data.filter((booking) => booking.status === "accepted")
          .length,
        resolved: data.filter((booking) => booking.status === "resolved")
          .length,
      };
      setStats(newStats);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusDialog(true);
  };

  const handleCloseDialog = () => {
    setStatusDialog(false);
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/bookings/${selectedBooking._id}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update local state to reflect changes
        setBookings(
          bookings.map((booking) =>
            booking._id === selectedBooking._id
              ? { ...booking, status: newStatus }
              : booking
          )
        );

        // Update stats
        const updatedStats = { ...stats };
        updatedStats[selectedBooking.status] -= 1;
        updatedStats[newStatus] += 1;
        setStats(updatedStats);

        setStatusDialog(false);
      } else {
        console.error("Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "booked":
        return <AccessTimeIcon fontSize="small" sx={{ color: "#f5b041" }} />;
      case "accepted":
        return <CheckCircleIcon fontSize="small" sx={{ color: "#3498db" }} />;
      case "resolved":
        return <DoneAllIcon fontSize="small" sx={{ color: "#2ecc71" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "booked":
        return "#f5b041";
      case "accepted":
        return "#3498db";
      case "resolved":
        return "#2ecc71";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Counsellor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your sessions and track client progress
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #e0e0e0", height: "100%" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 500 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All time bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #e0e0e0", height: "100%" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: 500, color: "#f5b041" }}
              >
                {stats.booked}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Awaiting acceptance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #e0e0e0", height: "100%" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Accepted
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: 500, color: "#3498db" }}
              >
                {stats.accepted}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                In progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #e0e0e0", height: "100%" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Resolved
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: 500, color: "#2ecc71" }}
              >
                {stats.resolved}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Completed sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bookings Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500, mb: 3 }}>
          Client Sessions
        </Typography>

        {bookings.length > 0 ? (
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} sm={6} lg={4} key={booking._id}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderLeft: `4px solid ${getStatusColor(booking.status)}`,
                    height: "100%",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: getStatusColor(booking.status),
                            mr: 1.5,
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          sx={{ fontWeight: 500 }}
                        >
                          {booking.userId
                            ? `Client ${booking.userId.toString().substr(-4)}`
                            : "Client"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={
                          booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)
                        }
                        icon={getStatusIcon(booking.status)}
                        sx={{
                          bgcolor: "transparent",
                          border: `1px solid ${getStatusColor(booking.status)}`,
                          color: getStatusColor(booking.status),
                          fontWeight: 500,
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarMonthIcon
                        sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                      />
                      <Typography variant="body2" color="text.primary">
                        {moment(booking.bookingDate).format(
                          "dddd, MMMM D, YYYY"
                        )}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <EventIcon
                        sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Booked {moment(booking.createdAt).fromNow()}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleStatusChange(booking)}
                      sx={{
                        mt: 1,
                        textTransform: "none",
                        borderColor: getStatusColor(booking.status),
                        color: getStatusColor(booking.status),
                        "&:hover": {
                          borderColor: getStatusColor(booking.status),
                          bgcolor: `${getStatusColor(booking.status)}10`,
                        },
                      }}
                    >
                      Update Status
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              border: "1px dashed #e0e0e0",
              borderRadius: 1,
              bgcolor: "#f9f9f9",
            }}
          >
            <Typography variant="body1" color="text.secondary" paragraph>
              You don't have any session bookings yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When clients book sessions with you, they will appear here.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Session Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {selectedBooking && (
              <Typography variant="body2" color="text.secondary" paragraph>
                Update status for session on{" "}
                {moment(selectedBooking.bookingDate).format("MMMM D, YYYY")}
              </Typography>
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="booked">Booked</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="reject">Reject</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            color="primary"
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CounsellorHome;
