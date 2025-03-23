import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { LocationOn, Home, AddCircleOutline } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Shelter = () => {
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces] = useState([]);
  const [shelters, setShelters] = useState([]);

  const [districtName, setDistrictName] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [selectedDistrictForPlace, setSelectedDistrictForPlace] = useState("");
  const [shelterName, setShelterName] = useState("");
  const [selectedDistrictForShelter, setSelectedDistrictForShelter] =
    useState("");
  const [selectedPlaceForShelter, setSelectedPlaceForShelter] = useState("");

  const navigate = useNavigate();

  // Fetch districts, places, and shelters from the backend
  useEffect(() => {
    fetchDistricts();
    fetchPlaces();
    fetchShelters();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/districts");
      setDistricts(response.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await axios.get("http://localhost:5000/places");
      setPlaces(response.data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const fetchShelters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/shelters");
      setShelters(response.data);
    } catch (error) {
      console.error("Error fetching shelters:", error);
    }
  };

  // Handle adding a new district
  const handleAddDistrict = async () => {
    if (!districtName.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/districts", {
        name: districtName,
      });
      setDistricts([...districts, response.data.newDistrict]);
      setDistrictName("");
    } catch (error) {
      console.error("Error adding district:", error);
    }
  };

  // Handle adding a new place
  const handleAddPlace = async () => {
    if (!placeName.trim() || !selectedDistrictForPlace) return;

    try {
      const response = await axios.post("http://localhost:5000/api/places", {
        name: placeName,
        districtId: selectedDistrictForPlace,
      });
      setPlaces([...places, response.data.newPlace]);
      setPlaceName("");
    } catch (error) {
      console.error("Error adding place:", error);
    }
  };

  // Handle adding a new shelter
  const handleAddShelter = async () => {
    if (
      !shelterName.trim() ||
      !selectedDistrictForShelter ||
      !selectedPlaceForShelter
    )
      return;

    try {
      const response = await axios.post("http://localhost:5000/api/shelters", {
        name: shelterName,
        districtId: selectedDistrictForShelter,
        placeId: selectedPlaceForShelter,
      });
      setShelters([...shelters, response.data.newShelter]);
      setShelterName("");
    } catch (error) {
      console.error("Error adding shelter:", error);
    }
  };

  // Filter places based on selected district for shelter
  const filteredPlaces = selectedDistrictForShelter
    ? places.filter((place) => {
        // Handle case where districtId might be an object
        const placeDistrictId = place.districtId?._id
          ? place.districtId._id // If populated object
          : place.districtId; // If string ID
        const match =
          String(placeDistrictId) === String(selectedDistrictForShelter);
        console.log(
          `Filtering: place=${place.name}, districtId=${placeDistrictId}, selected=${selectedDistrictForShelter}, match=${match}`
        );
        return match;
      })
    : [];
  console.log("Filtered Places:", filteredPlaces);

  return (
    <Box
      sx={{
        mx: "auto",
        background: "#f1f5f9",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
          mt: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            textAlign: "center",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Shelter Management
        </Typography>
        <IconButton
          onClick={() => {
            navigate("/officer/home");
          }}
          sx={{
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderRadius: 2,
            margin: 1,
            p: 1.5,
            "&:hover": {
              backgroundColor: "rgba(59, 130, 246, 0.2)",
            },
          }}
        >
          <HomeIcon sx={{ color: "#1976d2" }} />
        </IconButton>
      </Box>

      {/* Main Content Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 4,
          maxWidth: "1200px",
          mx: "auto",
          p: 2,
        }}
      >
        {/* District Card */}
        <Card
          sx={{
            p: 3,
            // borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <LocationOn sx={{ color: "#1976d2", mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "600" }}>
              Add District
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="District Name"
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddDistrict}
            disabled={!districtName.trim()}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
            startIcon={<AddCircleOutline />}
          >
            Add District
          </Button>

          <AnimatePresence>
            {districts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                sx={{ mt: 3 }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1,mt:2, color: "#555" }}>
                  Added Districts:
                </Typography>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {districts.map((district) => (
                    <motion.li
                      key={district._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ marginBottom: "8px" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: "#f5f5f5",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <LocationOn sx={{ color: "#1976d2", mr: 1 }} />
                        <Typography variant="body2">{district.name}</Typography>
                      </Box>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Place Card */}
        <Card
          sx={{
            p: 3,
            // borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <LocationOn sx={{ color: "#1976d2", mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "600" }}>
              Add Place
            </Typography>
          </Box>
          <Select
            fullWidth
            value={selectedDistrictForPlace}
            onChange={(e) => setSelectedDistrictForPlace(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="">Select a district</MenuItem>
            {districts.map((district) => (
              <MenuItem key={district._id} value={district._id}>
                {district.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            label="Place Name"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddPlace}
            disabled={!placeName.trim() || !selectedDistrictForPlace}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
            startIcon={<AddCircleOutline />}
          >
            Add Place
          </Button>

          <AnimatePresence>
            {places.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                sx={{ mt: 3 }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1,mt:2, color: "#555" }}>
                  Added Places:
                </Typography>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {places.map((place) => {
                    const district = districts.find(
                      (d) => d._id === place.districtId
                    );
                    return (
                      <motion.li
                        key={place._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ marginBottom: "8px" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#f5f5f5",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <LocationOn sx={{ color: "#1976d2", mr: 1 }} />
                          <Typography variant="body2">
                            {place.name} 
                            {/* (
                            {district ? district.name : "Unknown District"}) */}
                          </Typography>
                        </Box>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Shelter Card */}
        <Card
          sx={{
            p: 3,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Home sx={{ color: "#1976d2", mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "600" }}>
              Add Shelter
            </Typography>
          </Box>
          <Select
            fullWidth
            value={selectedDistrictForShelter}
            onChange={(e) => {
              setSelectedDistrictForShelter(e.target.value);
              setSelectedPlaceForShelter(""); // Reset place when district changes
            }}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="">Select a district</MenuItem>
            {districts.map((district) => (
              <MenuItem key={district._id} value={district._id}>
                {district.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            fullWidth
            value={selectedPlaceForShelter}
            onChange={(e) => setSelectedPlaceForShelter(e.target.value)}
            sx={{ mb: 2 }}
            disabled={
              !selectedDistrictForShelter || filteredPlaces.length === 0
            } // Disable if no places
            displayEmpty
          >
            <MenuItem value="">Select a place</MenuItem>
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => (
                <MenuItem key={place._id} value={place._id}>
                  {place.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No places available</MenuItem>
            )}
          </Select>
          <TextField
            fullWidth
            label="Shelter Name"
            value={shelterName}
            onChange={(e) => setShelterName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddShelter}
            disabled={
              !shelterName.trim() ||
              !selectedDistrictForShelter ||
              !selectedPlaceForShelter
            }
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
            startIcon={<AddCircleOutline />}
          >
            Add Shelter
          </Button>

          {/* Rest of the Shelter card (unchanged) */}
          <AnimatePresence>
            {shelters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                sx={{ mt: 3 }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1,mt:2, color: "#555" }}>
                  Added Shelters:
                </Typography>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {shelters.map((shelter) => {
                    const district = districts.find(
                      (d) => d._id === shelter.districtId
                    );
                    const place = places.find((p) => p._id === shelter.placeId);
                    return (
                      <motion.li
                        key={shelter._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ marginBottom: "8px" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#f5f5f5",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Home sx={{ color: "#1976d2", mr: 1 }} />
                          <Typography variant="body2">
                            {shelter.name} 
                            {/* (
                            {place ? place.name : "Unknown Place"},{" "}
                            {district ? district.name : "Unknown District"}) */}
                          </Typography>
                        </Box>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </Box>
    </Box>
  );
};

export default Shelter;
