import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Link,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Fade,
  Paper,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  FaDoorOpen,
  FaExclamationTriangle,
  FaHandsHelping,
  FaQuestion,
  FaShieldAlt,
  FaFileAlt,
  FaHome,
  FaPhone,
} from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { motion } from "framer-motion";

// Vibrant Color Palette
const colors = {
  primary: "#FF5722", // Vibrant orange
  secondary: "#E91E63", // Bright pink
  background: "#FCE4EC", // Light pink background
  card: "#FFFFFF", // White card backgrounds
  text: "#212121", // Dark gray for text
  lightText: "#757575", // Lighter gray for secondary content
  accent: "#9C27B0", // Purple accent
  white: "#FFFFFF", // Pure white
  divider: "#BDBDBD", // Light gray divider
  gradient: "linear-gradient(135deg, #FF5722 0%, #E91E63 100%)", // Gradient from orange to pink
};

// Styled Components
const NavLink = styled(Link)(({ theme }) => ({
  color: colors.text,
  textDecoration: "none",
  position: "relative",
  fontWeight: 500,
  padding: theme.spacing(1),
  transition: "all 0.2s ease",
  "&:hover": {
    color: colors.primary,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: "0%",
    height: "2px",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: colors.primary,
    transition: "width 0.3s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: "relative",
  textAlign: "center",
  padding: theme.spacing(15, 2),
  backgroundImage: "linear-gradient(135deg, #FF5722 0%, #E91E63 100%)",
  color: colors.white,
  borderRadius: "0 0 30px 30px",
  boxShadow: "0 10px 25px rgba(255, 87, 34, 0.2)",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 60%)",
    zIndex: 0,
  },
}));

const SOSButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: colors.white,
  fontWeight: 600,
  borderRadius: "50px",
  padding: theme.spacing(1.5, 4),
  fontSize: "1.1rem",
  boxShadow: "0 4px 12px rgba(233, 30, 99, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#C2185B", // Darker shade of pink
    transform: "translateY(-3px)",
    boxShadow: "0 8px 15px rgba(233, 30, 99, 0.4)",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  color: colors.primary,
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    bottom: -10,
    height: "4px",
    width: "60px",
    backgroundColor: colors.accent,
    borderRadius: "2px",
  },
}));

const ContentCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 4px 6px rgba(255, 87, 34, 0.15)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: colors.secondary, // Bright pink
    transform: "translateY(-2px)",
    boxShadow: "0 6px 10px rgba(233, 30, 99, 0.25)",
  },
}));

const QuickExitButton = styled(Button)(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: "#6200EA", // Deep purple color
  color: "#FFFFFF",
  gap: "2px",
  fontWeight: 500,
  borderRadius: "4px",
  padding: theme.spacing(1, 2.5),
  fontSize: "0.875rem",
  boxShadow: "0 2px 8px rgba(98, 0, 234, 0.2)",
  transition: "all 0.2s ease",
  zIndex: 1000,
  "&:hover": {
    backgroundColor: "#5000D3", // Slightly darker purple on hover
    boxShadow: "0 4px 12px rgba(98, 0, 234, 0.3)",
  },
  "&:active": {
    transform: "translateY(1px)",
    boxShadow: "0 1px 5px rgba(98, 0, 234, 0.2)",
  },
}));

// Home Page Component
const GuestHome = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleQuickExit = () => {
    if (window.confirm("Are you sure you want to exit quickly?")) {
      // Open Google in a new tab
      window.open("https://www.google.com", "_blank");

      // Attempt to close the current tab
      try {
        window.close();
      } catch (error) {
        console.error("Unable to close the current tab:", error);
        alert(
          "This tab cannot be closed automatically. Please close it manually."
        );
      }
    }
  };

  const navItems = [
    { name: "Home", icon: <FaHome />, href: "#" },
    { name: "About", icon: <FaShieldAlt />, href: "#about" },
    { name: "Support", icon: <FaHandsHelping />, href: "#support" },
    { name: "FAQs", icon: <FaQuestion />, href: "#faqs" },
    { name: "Report", icon: <FaFileAlt />, href: "#report" },
    { name: "Contact", icon: <FaPhone />, href: "#contact" },
  ];

  return (
    <Box sx={{ overflowX: "hidden", backgroundColor: colors.background }}>
      <QuickExitButton onClick={handleQuickExit}>
        <LogoutIcon />
        <Typography>Quick Exit</Typography>
      </QuickExitButton>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.divider}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", py: 1 }}
          >
            <Typography
              variant="h4"
              component={Link}
              href="/"
              sx={{
                fontWeight: 800,
                color: colors.primary,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                letterSpacing: "-0.5px",
              }}
            >
              DVSN
            </Typography>

            {isMobile ? (
              <>
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ color: colors.text }}
                >
                  {drawerOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </IconButton>
                <Drawer
                  anchor="right"
                  open={drawerOpen}
                  onClose={toggleDrawer}
                  PaperProps={{
                    sx: {
                      width: "70%",
                      padding: 2,
                      backgroundColor: colors.background,
                      borderRadius: "0px 0px 0px 16px",
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
                  >
                    <IconButton onClick={toggleDrawer}>
                      <HiX size={24} />
                    </IconButton>
                  </Box>
                  <List>
                    <ListItem
                      component={Link}
                      href="/"
                      onClick={toggleDrawer}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        "&:hover": {
                          backgroundColor: `${colors.primary}15`,
                        },
                      }}
                    >
                      <ListItemText primary="Home" />
                    </ListItem>
                    <ListItem
                      component={Link}
                      href="/login"
                      onClick={toggleDrawer}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        "&:hover": {
                          backgroundColor: `${colors.primary}15`,
                        },
                      }}
                    >
                      <ListItemText primary="Login" />
                    </ListItem>
                    <ListItem sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate("/signup")}
                        sx={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                          fontWeight: 600,
                          py: 1,
                          borderRadius: "8px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            backgroundColor: colors.primary,
                            transform: "translateY(-2px)",
                            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.15)",
                          },
                        }}
                      >
                        Signup
                      </Button>
                    </ListItem>
                  </List>
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <NavLink
                  href="/"
                  sx={{
                    mx: 2,
                    fontSize: "1.2rem",
                    position: "relative",
                    textDecoration: "none", 
                    padding: "6px 0", 
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "0",
                      height: "2px",
                      bottom: "0", 
                      left: "50%", 
                      transform: "translateX(-50%)", 
                      backgroundColor: colors.primary,
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%", 
                    },
                  }}
                >
                  Home
                </NavLink>
                <NavLink
                  href="/login"
                  sx={{
                    mx: 2,
                    fontSize: "1.2rem",
                    position: "relative",
                    textDecoration: "none",
                    padding: "6px 0",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "0",
                      height: "2px",
                      bottom: "0", 
                      left: "50%", 
                      transform: "translateX(-50%)", 
                      backgroundColor: colors.primary,
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%", 
                    },
                  }}
                >
                  Login
                </NavLink>
                <Button
                  variant="contained"
                  onClick={() => navigate("/register")}
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
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <HeroSection
        component={motion.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}
          >
            Safety & Support When You Need It Most
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              maxWidth: "700px",
              mx: "auto",
              mb: 4,
              opacity: 0.9,
              fontWeight: 400,
            }}
          >
            Cultivate Empathy through Education. Be an Advocate for Victims and
            Help Spread Awareness about Domestic Violence.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <ActionButton
              variant="contained"
              href="#support"
              sx={{
                backgroundColor: colors.white,
                color: colors.primary,
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              Get Help Now
            </ActionButton>
            <SOSButton
              onClick={() => navigate("/sos")}
              variant="contained"
              startIcon={<FaExclamationTriangle />}
            >
              Emergency SOS
            </SOSButton>
          </Box>
        </Container>
      </HeroSection>

      {/* About Section */}
      <Box
        id="about"
        component={motion.section}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        sx={{ py: 10 }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <SectionHeading variant="h3" component="h2">
                  About Our Mission
                </SectionHeading>
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.text,
                    fontSize: "1.1rem",
                    mb: 3,
                    lineHeight: 1.7,
                  }}
                >
                  At our Domestic Violence Support Network, we are dedicated to
                  providing compassionate and confidential support to
                  individuals affected by domestic violence.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.text,
                    fontSize: "1.1rem",
                    mb: 4,
                    lineHeight: 1.7,
                  }}
                >
                  We work with a network of trusted professionals and
                  organizations to offer comprehensive resources, including
                  legal aid, counseling, and safety planning. Our mission is to
                  empower survivors by connecting them with the help they need.
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <ActionButton
                    variant="contained"
                    sx={{ backgroundColor: colors.primary }}
                  >
                    Learn More
                  </ActionButton>
                  <ActionButton
                    variant="outlined"
                    sx={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Our Team
                  </ActionButton>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
                  aspectRatio: "4/3",
                  backgroundColor: "#FFCCBC", // Light orange
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: colors.primary,
                    fontWeight: 600,
                    textAlign: "center",
                    px: 3,
                  }}
                >
                  Empowering Survivors Through Compassion and Support
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Support Section */}
      <Box
        id="support"
        component={motion.section}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        sx={{ py: 10, backgroundColor: colors.card }}
      >
        <Container maxWidth="lg">
          <SectionHeading
            variant="h3"
            component="h2"
            sx={{ textAlign: "center" }}
          >
            Support & Resources
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{
              color: colors.lightText,
              fontSize: "1.1rem",
              textAlign: "center",
              maxWidth: "800px",
              mx: "auto",
              mb: 6,
            }}
          >
            If you or someone you know is experiencing domestic violence, it's
            important to know that help is available. You are not alone, and we
            are here to provide support, resources, and guidance.
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <FaHandsHelping size={40} color={colors.primary} />,
                title: "Immediate Help",
                description:
                  "Access emergency support and connect with professionals who can assist you right away.",
                action: "Get Help Now",
                href: "https://www.india.gov.in/help",
              },
              {
                icon: <FaShieldAlt size={40} color={colors.primary} />,
                title: "Safety Planning",
                description:
                  "Learn how to create a safety plan to protect yourself and your loved ones.",
                action: "Learn More",
                href: "https://ksandk.com/private-clients/domestic-violence-laws-india-legal/",
              },
              {
                icon: <FaFileAlt size={40} color={colors.primary} />,
                title: "Legal Assistance",
                description:
                  "Find legal resources and support to help you navigate the legal system.",
                action: "Explore Resources",
                href: "https://nyaaya.org/legal-explainer/what-are-the-rights-and-remedies-for-victims-against-domestic-violence/",
              },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <ContentCard>
                  <CardContent sx={{ textAlign: "center", p: 4 }}>
                    <Box sx={{ mb: 3 }}>{item.icon}</Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: 700, mb: 2, color: colors.text }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: colors.lightText, mb: 3 }}
                    >
                      {item.description}
                    </Typography>
                    <ActionButton
                      variant="contained"
                      href={item.href}
                      sx={{ backgroundColor: colors.primary }}
                    >
                      {item.action}
                    </ActionButton>
                  </CardContent>
                </ContentCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQs Section */}
      <Box
        id="faqs"
        component={motion.section}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        sx={{ py: 10 }}
      >
        <Container maxWidth="lg">
          <SectionHeading
            variant="h3"
            component="h2"
            sx={{ textAlign: "center" }}
          >
            Frequently Asked Questions
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{
              color: colors.lightText,
              fontSize: "1.1rem",
              textAlign: "center",
              maxWidth: "800px",
              mx: "auto",
              mb: 6,
            }}
          >
            Here are some common questions and answers about domestic violence
            and our services.
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                question: "What is domestic violence?",
                answer:
                  "Domestic violence refers to a pattern of abusive behavior used by one partner to gain or maintain control over another partner in an intimate relationship. It can take many forms, including physical, emotional, sexual, or psychological abuse.",
              },
              {
                question: "How can I tell if I'm in an abusive relationship?",
                answer:
                  "Signs of an abusive relationship include feeling afraid of your partner, being belittled or humiliated, having your freedoms restricted, experiencing physical violence, or feeling constantly controlled or manipulated.",
              },
              {
                question: "What should I do if I need help?",
                answer:
                  "If you need help, reach out to our support team immediately. We offer confidential assistance, safety planning, and resources to help you take the next steps.",
              },
            ].map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ContentCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 700, mb: 2, color: colors.text }}
                    >
                      {item.question}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: colors.lightText }}
                    >
                      {item.answer}
                    </Typography>
                  </CardContent>
                </ContentCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Report Section */}
      <Box
        id="report"
        component={motion.section}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        sx={{ py: 10, backgroundColor: colors.card }}
      >
        <Container maxWidth="lg">
          <SectionHeading
            variant="h3"
            component="h2"
            sx={{ textAlign: "center" }}
          >
            Report Abuse
          </SectionHeading>
          <Typography
            variant="body1"
            sx={{
              color: colors.lightText,
              fontSize: "1.1rem",
              textAlign: "center",
              maxWidth: "800px",
              mx: "auto",
              mb: 6,
            }}
          >
            If you need to report abuse or seek immediate help, please contact
            us or reach out to local authorities. Your safety is our priority.
          </Typography>
          <Box sx={{ textAlign: "center" }}>
            <ActionButton
              variant="contained"
              href="https://wcd.kerala.gov.in/service-info.php?service_category_sl=MTA="
              target="_blank"
              sx={{ backgroundColor: colors.secondary }}
            >
              Report Now
            </ActionButton>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          backgroundColor: colors.text,
          color: colors.white,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" sx={{ mb: 2 }}>
            &copy; 2023 Domestic Violence Support Network. All rights reserved.
          </Typography>
          <Typography variant="body1">
            Join us in advocating for the rights of domestic violence survivors.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default GuestHome;
