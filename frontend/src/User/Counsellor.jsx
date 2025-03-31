import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  Box,
  Divider,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import moment from "moment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const Counsellor = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [openBookedSessionsModal, setOpenBookedSessionsModal] = useState(false);
  const [loadingBookedSessions, setLoadingBookedSessions] = useState(false);
  const userId = sessionStorage.getItem("uID");

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/counsellors");
        setCounsellors(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching counsellors:", error);
        setLoading(false);
      }
    };

    fetchCounsellors();
  }, []);

  const handleOpenDateDialog = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDate("");
  };

  const handleDateChange = (event) => {
    const selected = event.target.value;
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    if (selected < tomorrow) {
      alert("Please select a future date.");
      return;
    }

    setSelectedDate(selected);
  };

  const handleBookSession = async () => {
    if (selectedCounsellor && selectedDate) {
      console.log(
        `Booking session with counsellor ID: ${selectedCounsellor._id} for date: ${selectedDate}`
      );

      try {
        // Make a POST request to the backend API
        const response = await axios.post("http://localhost:5000/booksession", {
          counsellorId: selectedCounsellor._id,
          bookingDate: selectedDate,
          userId: userId,
        });

        // If the booking is successful, add it to the local state
        const newBooking = {
          _id: response.data._id,
          counsellorId: selectedCounsellor._id,
          counsellorName: selectedCounsellor.name,
          bookingDate: selectedDate,
          createdAt: new Date().toISOString(),
          status: "booked",
        };

        setBookedSessions((prevSessions) => [...prevSessions, newBooking]);
        handleCloseDialog();
      } catch (error) {
        console.error("Error booking session:", error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  const fetchUserBookedSessions = async () => {
    try {
      setLoadingBookedSessions(true);
      // Make GET request to fetch user's booked sessions
      const response = await axios.get(
        `http://localhost:5000/user-sessions/${userId}`
      );
      setBookedSessions(response.data);
      setLoadingBookedSessions(false);
    } catch (error) {
      console.error("Error fetching booked sessions:", error);
      setLoadingBookedSessions(false);
    }
  };

  const handleOpenBookedSessions = () => {
    setOpenBookedSessionsModal(true);
    fetchUserBookedSessions();
  };

  const handleCloseBookedSessions = () => {
    setOpenBookedSessionsModal(false);
  };

  // Get tomorrow's date as the minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress size={24} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            color: "primary.dark",
          }}
        >
          Our Counsellors
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<CalendarMonthIcon />}
          onClick={handleOpenBookedSessions}
          sx={{
            textTransform: "none",
            borderRadius: 1,
          }}
        >
          My Booked Sessions
        </Button>
      </Box>

      <Grid container spacing={3}>
        {counsellors.map((counsellor) => (
          <Grid item xs={12} sm={6} md={4} key={counsellor._id}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  "&:hover": {
                    boxShadow: "0 2px 10px rgba(25, 118, 210, 0.1)",
                    borderColor: "primary.light",
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        mr: 2,
                        fontWeight: 500,
                      }}
                    >
                      {counsellor.name.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 400, color: "primary.dark" }}
                    >
                      {counsellor.name}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: "primary.light" }} />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, wordBreak: "break-word" }}
                  >
                    {counsellor.email}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontSize="12px"
                  >
                    Joined{" "}
                    {counsellor.createdAt
                      ? moment(counsellor.createdAt).fromNow()
                      : "recently"}
                  </Typography>
                </CardContent>

                <Box sx={{ px: 3, pb: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    sx={{
                      textTransform: "none",
                      py: 1,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "#fff",
                      },
                    }}
                    onClick={() => handleOpenDateDialog(counsellor)}
                  >
                    Book Session
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {counsellors.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No counsellors available at the moment.
          </Typography>
        </Box>
      )}

      {/* Date Selection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Select a Date for Your Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="date"
            label="Session Date"
            type="date"
            fullWidth
            variant="outlined"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Ensures only future dates (starting from tomorrow)
            }}
            sx={{ mt: 2 }}
          />

          {selectedCounsellor && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You're booking a session with {selectedCounsellor.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleBookSession}
            color="primary"
            disabled={!selectedDate}
          >
            Book
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booked Sessions Modal */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={openBookedSessionsModal}
        onClose={handleCloseBookedSessions}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseBookedSessions}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              My Booked Sessions
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          {loadingBookedSessions ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : bookedSessions.length > 0 ? (
            <List>
              {bookedSessions.map((session) => (
                <ListItem
                  key={session._id}
                  divider
                  sx={{
                    px: 0,
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      {session.counsellorName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={session.counsellorName}
                    secondary={
                      <Box component="span">
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          display="block"
                        >
                          {moment(session.bookingDate).format(
                            "dddd, MMMM D, YYYY"
                          )}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Booked {moment(session.createdAt).fromNow()}
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            mt: 1,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            bgcolor:
                              session.status === "booked"
                                ? "info.light"
                                : session.status === "accepted"
                                ? "success.light"
                                : "warning.light",
                            color:
                              session.status === "booked"
                                ? "info.dark"
                                : session.status === "accepted"
                                ? "success.dark"
                                : "warning.dark",
                          }}
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                You have no booked sessions.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, textTransform: "none" }}
                onClick={handleCloseBookedSessions}
              >
                Book Your First Session
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Counsellor;
