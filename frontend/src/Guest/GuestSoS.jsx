import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { styled } from "@mui/system";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Container,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const colors = {
  primary: "#FF5722", // Vibrant orange
  secondary: "#E91E63", // Bright pink
  // background: "#FCE4EC", // Light pink background
  card: "#FFFFFF", // White card backgrounds
  text: "#212121", // Dark gray for text
  lightText: "#757575", // Lighter gray for secondary content
  accent: "#9C27B0", // Purple accent
  white: "#FFFFFF", // Pure white
  divider: "#BDBDBD", // Light gray divider
  gradient: "linear-gradient(135deg, #FF5722 0%, #E91E63 100%)", // Gradient from orange to pink
};

// Icons (unchanged)
const HomeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" fill="currentColor" />
  </svg>
);

const LocationIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
      fill="currentColor"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 15.5C18.8 15.5 17.5 15.3 16.4 14.9C16.3 14.9 16.2 14.9 16.1 14.9C15.8 14.9 15.6 15 15.4 15.2L13.2 17.4C10.4 15.9 8 13.6 6.6 10.8L8.8 8.6C9.1 8.3 9.2 7.9 9 7.6C8.7 6.5 8.5 5.2 8.5 4C8.5 3.5 8 3 7.5 3H4C3.5 3 3 3.5 3 4C3 13.4 10.6 21 20 21C20.5 21 21 20.5 21 20V16.5C21 16 20.5 15.5 20 15.5ZM19 12H21C21 7 17 3 12 3V5C15.9 5 19 8.1 19 12ZM15 12H17C17 9.2 14.8 7 12 7V9C13.7 9 15 10.3 15 12Z"
      fill="currentColor"
    />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-9v2h2v-2h-2zm0-8v6h2V5h-2z"
      fill="currentColor"
    />
  </svg>
);

// Styled Components (updated with no border and enhanced box shadow)
const Header = styled(Box)(({ theme }) => ({
  backgroundColor: colors.white,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  position: "sticky",
  top: 0,
  zIndex: 10,
}));

const HeaderContent = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: 64,
  padding: "0 16px",
  [theme.breakpoints.up("sm")]: {
    padding: "0 24px",
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 700,
  color: colors.text,
}));

const MainContent = styled(Container)(({ theme }) => ({
  padding: "24px 16px",
  maxWidth: 1200,
  backgroundColor: colors.background,
  [theme.breakpoints.up("sm")]: {
    padding: "32px 24px",
  },
}));

const Widget = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  overflow: "hidden",
  transition: "box-shadow 0.3s ease",
  height: "100%",
  backgroundColor: colors.card,
  "&:hover": {
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
}));

const WidgetHeader = styled(Box)(({ theme }) => ({
  padding: "16px 20px",
  borderBottom: `1px solid ${colors.divider}`,
}));

const WidgetTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: colors.text,
}));

const WidgetContent = styled(Box)(({ theme }) => ({
  padding: "20px",
}));

const SosButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px 0 24px",
}));

const SosButton = styled(motion.button)(({ isactivated }) => ({
  width: 160,
  height: 160,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "none",
  outline: "none",
  cursor: isactivated === "true" ? "default" : "pointer",
  backgroundColor: isactivated === "true" ? colors.lightText : colors.primary,
  boxShadow:
    isactivated === "true"
      ? "0 4px 20px rgba(0, 0, 0, 0.15)"
      : `0 6px 24px ${colors.primary}40`,
  transition: "all 0.3s ease",
  position: "relative",
}));

const SosButtonText = styled(Typography)(({ theme }) => ({
  color: colors.white,
  fontSize: "2rem",
  fontWeight: 700,
  letterSpacing: 1,
}));

const SosDescription = styled(Typography)(({ theme }) => ({
  marginTop: 24,
  textAlign: "center",
  color: colors.lightText,
  fontSize: "0.95rem",
  maxWidth: 280,
}));

const CancelButton = styled(Button)(({ theme }) => ({
  marginTop: 24,
  borderRadius: 8,
  padding: "8px 16px",
  textTransform: "none",
  fontWeight: 500,
  backgroundColor: colors.secondary,
  color: colors.white,
  "&:hover": {
    backgroundColor: colors.accent,
  },
}));

const ContactCard = styled(motion.div)(({ theme }) => ({
  padding: 16,
  marginBottom: 12,
  borderRadius: 12,
  backgroundColor: colors.card,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    transform: "translateY(-2px)",
  },
}));

const ContactCardContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  padding: 8,
  marginRight: 12,
  backgroundColor: colors.background,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const ContactName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: colors.text,
  fontSize: "0.95rem",
}));

const ContactDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: 4,
  flexWrap: "wrap",
}));

const ContactNumber = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: colors.lightText,
  fontSize: "0.85rem",
  marginRight: 12,
}));

const ContactRelation = styled(Box)(({ theme }) => ({
  backgroundColor: colors.background,
  color: colors.lightText,
  fontSize: "0.75rem",
  padding: "4px 10px",
  borderRadius: 16,
  fontWeight: 500,
}));

const LocationWidget = styled(motion.div)(({ theme }) => ({
  backgroundColor: colors.card,
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  padding: 20,
  marginTop: 24,
}));

const LocationHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
}));

const LocationIconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: colors.background,
  color: colors.primary,
  padding: 8,
  borderRadius: "50%",
  marginRight: 12,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const LocationTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: colors.text,
  fontSize: "1rem",
}));

const LocationDetails = styled(Box)(({ theme }) => ({
  marginTop: 12,
  paddingLeft: 40,
}));

const LocationAddress = styled(Typography)(({ theme }) => ({
  color: colors.lightText,
  fontSize: "0.9rem",
  marginBottom: 4,
}));

const LocationCoordinates = styled(Typography)(({ theme }) => ({
  color: colors.lightText,
  fontSize: "0.8rem",
}));

const LoadingSpinner = styled("div")({
  width: 48,
  height: 48,
  border: `4px solid ${colors.divider}`,
  borderTop: `4px solid ${colors.primary}`,
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
});

// Emergency Contact Card Component (unchanged)
const EmergencyContactCard = ({ name, number, relation, icon }) => (
  <ContactCard
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <ContactCardContent>
      <IconWrapper>{icon}</IconWrapper>
      <ContactInfo>
        <ContactName>{name}</ContactName>
        <ContactDetails>
          <ContactNumber>
            <PhoneIcon style={{ marginRight: 4 }} />
            {number}
          </ContactNumber>
          <ContactRelation>{relation}</ContactRelation>
        </ContactDetails>
      </ContactInfo>
    </ContactCardContent>
  </ContactCard>
);

const SOSPage = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Fetch real-time geolocation (unchanged)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
        },
        (error) => {
          setSnackbarMessage(
            "Failed to fetch location. Please enable location services."
          );
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      );
    } else {
      setSnackbarMessage("Geolocation is not supported by your browser.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, []);

  const handleActivate = () => {
    if (isActivated) return;

    setIsActivated(true);
    setLoading(true);

    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            try {
              const response = await axios.post(
                "http://localhost:5000/anonymusSos",
                locationData
              );

              if (response.status === 201) {
                setSnackbarMessage("Emergency alert sent successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
              }
            } catch (error) {
              console.error("Error sending SOS request:", error);
              setSnackbarMessage("Failed to send emergency alert.");
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setSnackbarMessage("Failed to fetch location.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            setLoading(false);
          }
        );
      } else {
        setSnackbarMessage("Geolocation is not supported by your browser.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
      }
    }, 5000);
  };

  const handleReset = () => {
    setIsActivated(false);
  };

  const navigateToHome = () => {
    window.location.href = "/";
  };
  const navigateToLogin = () => {
    window.location.href = "/login";
  };
  const navigateToSignup = () => {
    window.location.href = "/register";
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: colors.background }}>
      {/* Top navigation */}
      <Header>
        <HeaderContent
          maxWidth="lg"
          sx={{ display: "flex", alignItems: "center" }}
        >
          {/* Home Icon */}
          <IconButton
            onClick={navigateToHome}
            sx={{
              p: 1,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            <HomeIcon />
          </IconButton>

          {/* Page Title */}
          <PageTitle
            variant="h1"
            sx={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: colors.text,
              ml: 2,
            }}
          >
            Emergency SOS
          </PageTitle>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Login Button */}
          <Button
            variant="text"
            onClick={navigateToLogin}
            sx={{
              color: colors.text,
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "8px",
              padding: "8px 16px",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            Login
          </Button>

          {/* Sign Up Button */}
          <Button
            variant="contained"
            onClick={navigateToSignup}
            sx={{
              backgroundColor: colors.primary,
              fontWeight: 600,
              borderRadius: "8px",
              textTransform: "none",
              px: 3,
              py: 1,
              ml: 1,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                backgroundColor: colors.primary,
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            Signup
          </Button>
        </HeaderContent>
      </Header>

      <MainContent maxWidth="lg">
        <Grid container spacing={3}>
          {/* SOS Button Widget */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Widget>
                <WidgetHeader>
                  <WidgetTitle align="center">Emergency Assistance</WidgetTitle>
                </WidgetHeader>

                <WidgetContent>
                  <SosButtonContainer>
                    <motion.div
                      whileHover={!isActivated ? { scale: 1.05 } : {}}
                      whileTap={!isActivated ? { scale: 0.95 } : {}}
                    >
                      <SosButton
                        onClick={!isActivated ? handleActivate : undefined}
                        disabled={isActivated}
                        isactivated={isActivated.toString()}
                      >
                        {loading ? (
                          <LoadingSpinner />
                        ) : (
                          <SosButtonText>SOS</SosButtonText>
                        )}

                        {!isActivated && !loading && (
                          <motion.div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              borderRadius: "50%",
                              backgroundColor: colors.primary,
                              opacity: 0.3,
                            }}
                            animate={{
                              scale: [1, 1.5, 1.5],
                              opacity: [0.7, 0, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "loop",
                            }}
                          />
                        )}
                      </SosButton>
                    </motion.div>

                    <SosDescription>
                      {isActivated
                        ? "Emergency alert sent to your contacts and local services"
                        : "Press the SOS button to alert emergency contacts and services"}
                    </SosDescription>

                    {isActivated && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <CancelButton variant="outlined" onClick={handleReset}>
                          Cancel Emergency Alert
                        </CancelButton>
                      </motion.div>
                    )}
                  </SosButtonContainer>
                </WidgetContent>
              </Widget>
            </motion.div>
          </Grid>

          {/* Emergency Contacts Widget */}
          <Grid item xs={12} md={6}>
            <Widget>
              <WidgetHeader>
                <WidgetTitle>Emergency Contacts</WidgetTitle>
              </WidgetHeader>

              <WidgetContent>
                <EmergencyContactCard
                  name="Emergency Response Support System (ERSS)"
                  number="112"
                  relation="Unified Emergency Number"
                  icon={<AlertIcon />}
                />
                <EmergencyContactCard
                  name="Police"
                  number="100"
                  relation="Crime & Law Enforcement"
                  icon={<AlertIcon />}
                />
                <EmergencyContactCard
                  name="Fire"
                  number="101"
                  relation="Fire Emergencies"
                  icon={<AlertIcon />}
                />
                <EmergencyContactCard
                  name="Ambulance"
                  number="102"
                  relation="Medical Emergencies"
                  icon={<AlertIcon />}
                />
              </WidgetContent>
            </Widget>
          </Grid>
        </Grid>

        {/* Location Widget */}
        {location && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LocationWidget>
              <LocationHeader>
                <LocationIconWrapper>
                  <LocationIcon />
                </LocationIconWrapper>
                <LocationTitle>Your Current Location</LocationTitle>
              </LocationHeader>

              <LocationDetails>
                <LocationCoordinates>
                  Latitude: {location.latitude}, Longitude: {location.longitude}
                </LocationCoordinates>
              </LocationDetails>
            </LocationWidget>
          </motion.div>
        )}
      </MainContent>

      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: 2,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SOSPage;
