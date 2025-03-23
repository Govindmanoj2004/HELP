import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Container,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  CircularProgress,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Mock data for testing when API fails
const mockDistricts = [
  { _id: "d1", name: "North District" },
  { _id: "d2", name: "South District" },
  { _id: "d3", name: "East District" },
  { _id: "d4", name: "West District" },
];

const mockPlaces = [
  { _id: "p1", name: "Downtown", districtId: { _id: "d1" } },
  { _id: "p2", name: "Uptown", districtId: { _id: "d1" } },
  { _id: "p3", name: "Harbor", districtId: { _id: "d2" } },
  { _id: "p4", name: "Riverside", districtId: { _id: "d2" } },
  { _id: "p5", name: "Hill Area", districtId: { _id: "d3" } },
  { _id: "p6", name: "Valley", districtId: { _id: "d4" } },
];

const mockShelters = [
  {
    _id: "s1",
    name: "Safe Haven",
    type: "Emergency",
    capacity: "50",
    placeId: { _id: "p1" },
    address: "123 Main St, Downtown",
    amenities: ["Beds", "Food", "Shower", "Electricity"],
    availableSpots: 12,
  },
  {
    _id: "s2",
    name: "Community Center",
    type: "Temporary",
    capacity: "100",
    placeId: { _id: "p1" },
    address: "456 Oak Ave, Downtown",
    amenities: ["Beds", "Food", "Medical", "Childcare"],
    availableSpots: 35,
  },
  {
    _id: "s3",
    name: "Harbor Refuge",
    type: "Permanent",
    capacity: "75",
    placeId: { _id: "p3" },
    address: "789 Harbor Blvd, Harbor",
    amenities: ["Beds", "Food", "Laundry", "Internet"],
    availableSpots: 0,
  },
  {
    _id: "s4",
    name: "Hill Shelter",
    type: "Emergency",
    capacity: "40",
    placeId: { _id: "p5" },
    address: "101 Hill St, Hill Area",
    amenities: ["Beds", "Food", "Clothing"],
    availableSpots: 8,
  },
  {
    _id: "s5",
    name: "Valley Center",
    type: "Emergency",
    capacity: "60",
    placeId: { _id: "p6" },
    address: "202 Valley Rd, Valley",
    amenities: ["Beds", "Food", "Shower", "Heating"],
    availableSpots: 15,
  },
];

// Type color mapping
const typeColors = {
  Emergency: "#f44336", // Red
  Temporary: "#ff9800", // Orange
  Permanent: "#4caf50", // Green
};

const Shelter = () => {
  const theme = useTheme();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        );

        // Try to fetch real data with a timeout
        try {
          const districtsPromise = axios.get("http://localhost:5000/districts");
          const placesPromise = axios.get("http://localhost:5000/places");
          const sheltersPromise = axios.get("http://localhost:5000/shelters");

          const [districtsResponse, placesResponse, sheltersResponse] =
            await Promise.race([
              Promise.all([districtsPromise, placesPromise, sheltersPromise]),
              timeoutPromise.then(() => {
                throw new Error("API request timed out");
              }),
            ]);

          setDistricts(districtsResponse.data);
          setPlaces(placesResponse.data);
          setShelters(sheltersResponse.data);
          setLoading(false);
        } catch (error) {
          console.error("API Error:", error);
          // If API fails, use mock data
          setUseMockData(true);
          setDistricts(mockDistricts);
          setPlaces(mockPlaces);
          setShelters(mockShelters);
          setLoading(false);
          setError("Could not connect to the server. Using demo data instead.");
        }
      } catch (finalError) {
        console.error("Fatal Error:", finalError);
        setError("An unexpected error occurred. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Added null checks for place.districtId
  const filteredPlaces = selectedDistrict
    ? places.filter(
        (place) => place.districtId && place.districtId._id === selectedDistrict
      )
    : [];

  const handleSearch = () => {
    // Added null checks for shelter.placeId
    const results = shelters.filter(
      (shelter) => shelter.placeId && shelter.placeId._id === selectedPlace
    );
    setSearchResults(results);
  };

  // Add logging to debug the component state
  useEffect(() => {
    console.log("Component state:", {
      loading,
      error,
      useMockData,
      districtsCount: districts.length,
      placesCount: places.length,
      sheltersCount: shelters.length,
    });
  }, [loading, error, useMockData, districts, places, shelters]);

  // Get district and place names for display
  const getDistrictName = (id) => {
    const district = districts.find((d) => d._id === id);
    return district ? district.name : "";
  };

  const getPlaceName = (id) => {
    const place = places.find((p) => p._id === id);
    return place ? place.name : "";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            textAlign: "center",
            mb: 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            WebkitBackgroundClip: "text",
          }}
        >
          Find a Shelter
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 6, fontWeight: 400 }}
        >
          Search for available shelters in your area by selecting a district and
          place
        </Typography>
      </motion.div>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            my: 8,
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography sx={{ mt: 3, color: "text.secondary" }}>
            Loading shelter information...
          </Typography>
        </Box>
      ) : (
        <>
          {useMockData && notificationVisible && (
            <Fade in={notificationVisible}>
              <Paper
                sx={{
                  p: 2,
                  mb: 4,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${theme.palette.warning.main}`,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InfoIcon color="warning" />
                  <Typography color="warning.dark">
                    Using demo data. The server connection failed.
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setNotificationVisible(false)}
                  aria-label="Close notification"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Fade>
          )}

          {error && !useMockData && (
            <Typography color="error" sx={{ textAlign: "center", my: 2 }}>
              {error}
            </Typography>
          )}

          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              mb: 4,
              background: `linear-gradient(to right, ${alpha(
                theme.palette.background.paper,
                0.9
              )}, ${alpha(theme.palette.background.paper, 0.9)}), 
                           url('https://source.unsplash.com/random/1000x400/?shelter')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Search Shelters
            </Typography>
            <Grid container spacing={3} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>District</InputLabel>
                  <Select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedPlace("");
                      setSearchResults([]);
                    }}
                    label="District"
                    sx={{ bgcolor: alpha(theme.palette.background.paper, 0.9) }}
                  >
                    <MenuItem value="">
                      <em>Select a district</em>
                    </MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district._id} value={district._id}>
                        {district.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5}>
                <FormControl
                  fullWidth
                  disabled={!selectedDistrict || filteredPlaces.length === 0}
                  variant="outlined"
                >
                  <InputLabel>Place</InputLabel>
                  <Select
                    value={selectedPlace}
                    onChange={(e) => {
                      setSelectedPlace(e.target.value);
                      setSearchResults([]);
                    }}
                    label="Place"
                    sx={{ bgcolor: alpha(theme.palette.background.paper, 0.9) }}
                  >
                    <MenuItem value="">
                      <em>Select a place</em>
                    </MenuItem>
                    {filteredPlaces.map((place) => (
                      <MenuItem key={place._id} value={place._id}>
                        {place.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!selectedPlace}
                  fullWidth
                  startIcon={<SearchIcon />}
                  size="large"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    "&:hover": {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {selectedDistrict && selectedPlace && (
            <Box
              sx={{
                mb: 4,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Searching in:
              </Typography>
              <Chip
                icon={<LocationOnIcon />}
                label={getDistrictName(selectedDistrict)}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                &gt;
              </Typography>
              <Chip
                icon={<LocationOnIcon />}
                label={getPlaceName(selectedPlace)}
                color="secondary"
                variant="outlined"
                size="small"
              />
            </Box>
          )}

          <AnimatePresence>
            {searchResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <LocationOnIcon color="primary" /> Available Shelters
                  <Chip
                    label={`${searchResults.length} found`}
                    size="small"
                    color="primary"
                    sx={{ ml: 2 }}
                  />
                </Typography>
                <Grid container spacing={3}>
                  {searchResults.map((shelter) => (
                    <Grid item xs={12} md={6} key={shelter._id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          sx={{
                            borderRadius: 3,
                            boxShadow: 4,
                            overflow: "hidden",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                              boxShadow: 8,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              height: 16,
                              bgcolor:
                                typeColors[shelter.type] ||
                                theme.palette.primary.main,
                            }}
                          />
                          <CardContent sx={{ p: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 2,
                              }}
                            >
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {shelter.name}
                              </Typography>
                              <Chip
                                label={shelter.type}
                                size="small"
                                sx={{
                                  bgcolor:
                                    typeColors[shelter.type] ||
                                    theme.palette.primary.main,
                                  color: "#fff",
                                  fontWeight: 600,
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <LocationOnIcon
                                fontSize="small"
                                color="action"
                                sx={{ mr: 1 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {shelter.address || "Address not available"}
                              </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <PersonIcon
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="body2">
                                  <strong>Capacity:</strong> {shelter.capacity}
                                </Typography>
                              </Box>
                              <Chip
                                label={
                                  shelter.availableSpots > 0
                                    ? `${shelter.availableSpots} spots available`
                                    : "Currently full"
                                }
                                size="small"
                                color={
                                  shelter.availableSpots > 0
                                    ? "success"
                                    : "error"
                                }
                                variant="outlined"
                              />
                            </Box>

                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Amenities:
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ flexWrap: "wrap", gap: 1 }}
                            >
                              {shelter.amenities ? (
                                shelter.amenities.map((amenity, index) => (
                                  <Chip
                                    key={index}
                                    label={amenity}
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderRadius: 1 }}
                                  />
                                ))
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No amenities listed
                                </Typography>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            ) : (
              !loading &&
              searchResults.length === 0 &&
              selectedPlace && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: "center",
                      my: 4,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                    }}
                  >
                    <HomeIcon
                      sx={{
                        fontSize: 50,
                        color: "text.secondary",
                        mb: 2,
                        opacity: 0.7,
                      }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No shelters found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      There are no shelters available in{" "}
                      {getPlaceName(selectedPlace)}. Please try another
                      location.
                    </Typography>
                  </Paper>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </>
      )}
    </Container>
  );
};

export default Shelter;
