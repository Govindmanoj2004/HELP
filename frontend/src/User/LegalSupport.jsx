import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Box,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import {
  CalendarToday,
  VideoCall,
  Person,
  Cancel,
  CheckCircle,
  Info,
  Refresh,
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:5000";

const LegalSupport = () => {
  const [legalExperts, setLegalExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState("");
  const [bookingDate, setBookingDate] = useState(moment());
  const [consultationType, setConsultationType] = useState("online");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState({
    experts: false,
    bookings: false,
    submitting: false,
    cancelling: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookings, setBookings] = useState([]);

  const victimId = sessionStorage.getItem("uID");

  const fetchExperts = async () => {
    setIsLoading((prev) => ({ ...prev, experts: true }));
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/legal-supports`);
      setLegalExperts(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch legal experts. Please try again later."
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, experts: false }));
    }
  };

  const fetchBookings = async () => {
    setIsLoading((prev) => ({ ...prev, bookings: true }));
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        params: { victimId },
      });
      setBookings(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch your bookings. Please try again later."
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, bookings: false }));
    }
  };

  useEffect(() => {
    fetchExperts();
    if (victimId) {
      fetchBookings();
    }
  }, [victimId]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, submitting: true }));
    setError("");
    setSuccess("");

    if (!victimId) {
      setError("Please sign in as a victim to book a consultation");
      setIsLoading((prev) => ({ ...prev, submitting: false }));
      return;
    }

    if (!selectedExpert) {
      setError("Please select a legal expert");
      setIsLoading((prev) => ({ ...prev, submitting: false }));
      return;
    }

    if (!bookingDate) {
      setError("Please select a date and time");
      setIsLoading((prev) => ({ ...prev, submitting: false }));
      return;
    }

    if (bookingDate.isBefore(moment())) {
      setError("Please select a future date and time");
      setIsLoading((prev) => ({ ...prev, submitting: false }));
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        legalSupportId: selectedExpert,
        victimId,
        bookingDate: bookingDate.toISOString(),
        consultationType,
        notes,
      });

      setSuccess("Booking request sent successfully!");
      setBookings([response.data, ...bookings]);

      setSelectedExpert("");
      setBookingDate(moment());
      setConsultationType("online");
      setNotes("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again later."
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setIsLoading((prev) => ({ ...prev, cancelling: true }));
    setError("");
    setSuccess("");

    try {
      await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`, {
        params: { victimId },
      });
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
      setSuccess("Booking cancelled successfully");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Cancellation failed. Please try again later."
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, cancelling: false }));
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <Chip
            icon={<CheckCircle fontSize="small" />}
            label="Confirmed"
            color="success"
            size="small"
            variant="outlined"
          />
        );
      case "pending":
        return (
          <Chip
            label="Pending"
            color="warning"
            size="small"
            variant="outlined"
          />
        );
      case "cancelled":
        return (
          <Chip
            icon={<Cancel fontSize="small" />}
            label="Cancelled"
            color="error"
            size="small"
            variant="outlined"
          />
        );
      case "completed":
        return (
          <Chip
            label="Completed"
            color="primary"
            size="small"
            variant="outlined"
          />
        );
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Legal Support Consultation
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Connect with experienced legal professionals
            </Typography>
          </Box>
        </motion.div>

        {!victimId && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Please sign in to book a consultation or view your bookings.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Booking Form */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" fontWeight={600}>
                    New Consultation
                  </Typography>
                  <Tooltip title="Refresh experts list">
                    <IconButton
                      onClick={fetchExperts}
                      disabled={isLoading.experts}
                      size="small"
                      sx={{ color: "primary.main" }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                        {success}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleBookingSubmit}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="expert-label">Legal Expert</InputLabel>
                    <Select
                      labelId="expert-label"
                      value={selectedExpert}
                      label="Legal Expert"
                      onChange={(e) => setSelectedExpert(e.target.value)}
                      required
                      disabled={!victimId}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">
                        <em>Select an expert</em>
                      </MenuItem>
                      {legalExperts.map((expert) => (
                        <MenuItem key={expert._id} value={expert._id}>
                          {expert.name} - {expert.specialization?.join(", ")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <DatePicker
                      label="Date & Time"
                      value={bookingDate}
                      onChange={(newValue) => setBookingDate(newValue)}
                      minDate={moment()}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ borderRadius: 2 }} />
                      )}
                      disabled={!victimId}
                    />
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="consultation-type-label">
                      Consultation Type
                    </InputLabel>
                    <Select
                      labelId="consultation-type-label"
                      value={consultationType}
                      label="Consultation Type"
                      onChange={(e) => setConsultationType(e.target.value)}
                      disabled={!victimId}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="online">
                        <VideoCall sx={{ mr: 1, fontSize: "small" }} /> Online
                        (Video Call)
                      </MenuItem>
                      <MenuItem value="in-person">
                        <Person sx={{ mr: 1, fontSize: "small" }} /> In-Person
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <TextField
                      label="Notes (Optional)"
                      multiline
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      variant="outlined"
                      placeholder="Briefly describe your legal issue..."
                      disabled={!victimId}
                      sx={{ borderRadius: 2 }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading.submitting || !victimId}
                    startIcon={
                      isLoading.submitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    {isLoading.submitting
                      ? "Processing..."
                      : victimId
                      ? "Book Consultation"
                      : "Please Sign In"}
                  </Button>
                </form>
              </Paper>
            </motion.div>
          </Grid>

          {/* User's Bookings */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Your Bookings
                  </Typography>
                  <Tooltip title="Refresh bookings">
                    <IconButton
                      onClick={fetchBookings}
                      disabled={isLoading.bookings || !victimId}
                      size="small"
                      sx={{ color: "primary.main" }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {!victimId ? (
                  <Box
                    textAlign="center"
                    py={4}
                    sx={{ color: "text.secondary" }}
                  >
                    <Info
                      fontSize="large"
                      sx={{ mb: 1, color: "action.active" }}
                    />
                    <Typography>Sign in to view your bookings</Typography>
                  </Box>
                ) : bookings.length === 0 ? (
                  <Box
                    textAlign="center"
                    py={4}
                    sx={{ color: "text.secondary" }}
                  >
                    {isLoading.bookings ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <Info
                          fontSize="large"
                          sx={{ mb: 1, color: "action.active" }}
                        />
                        <Typography>You have no upcoming bookings</Typography>
                      </>
                    )}
                  </Box>
                ) : (
                  <motion.div layout>
                    <AnimatePresence>
                      {bookings.map((booking) => (
                        <motion.div
                          key={booking._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              mb: 2,
                              p: 2,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Grid container spacing={1} alignItems="center">
                              <Grid item xs={8}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={500}
                                >
                                  {booking.legalSupportId?.name ||
                                    "Legal Expert"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 0.5,
                                  }}
                                >
                                  <CalendarToday
                                    sx={{
                                      fontSize: 14,
                                      mr: 1,
                                      color: "action.active",
                                    }}
                                  />
                                  {moment(booking.bookingDate).format(
                                    "MMMM Do YYYY, h:mm a"
                                  )}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  {getStatusChip(booking.status)}
                                </Box>
                              </Grid>
                              <Grid item xs={4} textAlign="right">
                                {["pending", "confirmed"].includes(
                                  booking.status
                                ) && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      handleCancelBooking(booking._id)
                                    }
                                    disabled={isLoading.cancelling}
                                    startIcon={<Cancel />}
                                    sx={{
                                      borderRadius: 2,
                                      textTransform: "none",
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </Grid>
                            </Grid>

                            {booking.notes && (
                              <>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Notes:</strong> {booking.notes}
                                </Typography>
                              </>
                            )}
                          </Paper>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default LegalSupport;
