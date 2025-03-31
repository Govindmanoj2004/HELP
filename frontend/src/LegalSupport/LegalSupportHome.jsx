import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Divider,
  Alert,
  Paper,
  Avatar,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Edit,
  Refresh,
  Close,
  CheckCircle,
  Event,
  Person,
  Notes,
  Schedule,
  Cancel,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";

const API_BASE_URL = "http://localhost:5000";

const LegalSupportHome = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    update: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(moment());

  const legalSupportId = sessionStorage.getItem("lID");

  const fetchBookings = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/bookings/legal-support/${legalSupportId}`
      );
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    if (legalSupportId) {
      fetchBookings();
    }
  }, [legalSupportId]);

  const getValidStatusOptions = (currentStatus) => {
    const statusOptions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    return [currentStatus, ...statusOptions[currentStatus]];
  };

  const handleEditClick = (booking) => {
    setCurrentBooking(booking);
    setStatus(booking.status);
    setNotes(booking.notes || "");
    setDate(moment(booking.bookingDate));
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      setLoading((prev) => ({ ...prev, update: true }));
      setError("");
      setSuccess("");

      if (!date || date.isBefore(moment())) {
        throw new Error("Please select a future date");
      }

      const validOptions = getValidStatusOptions(currentBooking.status);
      if (!validOptions.includes(status)) {
        throw new Error(
          `Invalid status transition from ${currentBooking.status} to ${status}`
        );
      }

      const response = await axios.patch(
        `${API_BASE_URL}/bookingsUpdate/${currentBooking._id}`,
        {
          status,
          notes: notes || undefined,
          bookingDate: date.toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setBookings(
        bookings.map((b) => (b._id === currentBooking._id ? response.data : b))
      );
      setSuccess("Booking updated successfully");
      setEditOpen(false);
    } catch (err) {
      console.error("Update error details:", {
        message: err.message,
        response: err.response?.data,
        config: err.config,
      });

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update booking. Please check your changes and try again.";

      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      pending: { color: "warning", icon: <Schedule color="warning" /> },
      confirmed: { color: "success", icon: <CheckCircle color="success" /> },
      cancelled: { color: "error", icon: <Close color="error" /> },
      completed: { color: "info", icon: <CheckCircle color="info" /> },
    };

    return (
      <Chip
        icon={statusMap[status]?.icon}
        label={status.toUpperCase()}
        color={statusMap[status]?.color || "default"}
        size="small"
        variant="outlined"
        sx={{
          textTransform: "uppercase",
          fontWeight: 600,
          borderRadius: 1,
        }}
      />
    );
  };

  const handleCloseDialog = () => {
    setEditOpen(false);
    setError("");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Appointment Management
            </Typography>
            <IconButton
              onClick={fetchBookings}
              disabled={loading.fetch}
              color="primary"
              sx={{
                backgroundColor: "action.hover",
                "&:hover": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError("")}
              elevation={1}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3 }}
              onClose={() => setSuccess("")}
              elevation={1}
            >
              {success}
            </Alert>
          )}

          {loading.fetch && !bookings.length ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : bookings.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                textAlign: "center",
              }}
            >
              <Event color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No appointments scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You currently have no upcoming appointments.
              </Typography>
            </Box>
          ) : (
            <AnimatePresence>
              <Stack spacing={2}>
                {bookings.map((booking) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        "&:hover": {
                          boxShadow: 1,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "primary.main",
                                  width: 32,
                                  height: 32,
                                  mr: 1.5,
                                }}
                              >
                                <Person fontSize="small" />
                              </Avatar>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {booking.victimId?.name || "Client"}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1.5,
                                color: "text.secondary",
                              }}
                            >
                              <Event fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {moment(booking.bookingDate).format(
                                  "MMMM D, YYYY"
                                )}
                              </Typography>
                              <Typography variant="body2" sx={{ mx: 0.5 }}>
                                •
                              </Typography>
                              <Typography variant="body2">
                                {moment(booking.bookingDate).format("h:mm A")}
                              </Typography>
                            </Box>

                            {booking.notes && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  mt: 1.5,
                                }}
                              >
                                <Notes
                                  color="disabled"
                                  fontSize="small"
                                  sx={{ mr: 1, mt: 0.5 }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {booking.notes}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 1,
                            }}
                          >
                            {getStatusChip(booking.status)}
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit fontSize="small" />}
                              onClick={() => handleEditClick(booking)}
                              disabled={["completed", "cancelled"].includes(
                                booking.status
                              )}
                              sx={{
                                textTransform: "none",
                                borderRadius: 1,
                                minWidth: 90,
                              }}
                            >
                              Edit
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Stack>
            </AnimatePresence>
          )}
        </Paper>

        {/* Edit Dialog */}
        <Dialog
          open={editOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Update Appointment
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Box sx={{ my: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <FormControl fullWidth sx={{ mb: 3 }}>
                <DatePicker
                  label="Appointment Date"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  minDate={moment()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel size="small">Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading.update}
                  size="small"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {currentBooking &&
                    getValidStatusOptions(currentBooking.status).map(
                      (option) => (
                        <MenuItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </MenuItem>
                      )
                    )}
                </Select>
              </FormControl>

              <TextField
                label="Notes"
                multiline
                rows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading.update}
                size="small"
                InputProps={{
                  sx: {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={loading.update}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={loading.update}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                minWidth: 100,
              }}
              startIcon={loading.update ? <CircularProgress size={20} /> : null}
            >
              {loading.update ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default LegalSupportHome;
