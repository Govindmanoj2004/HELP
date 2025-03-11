const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// HTTP & WebSocket Server
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Byu:Byu@kohai.zxe75.mongodb.net/db_help",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

connectDB();

// Models & Schemas
const VictimSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const OfficerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const HelpRequestSchema = new mongoose.Schema({
  victimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Victim",
    required: true,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "in_chat", "resolved"],
    default: "pending",
  },
  assignedOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officer",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

const Victim = mongoose.model("Victim", VictimSchema);
const Officer = mongoose.model("Officer", OfficerSchema);
const HelpRequest = mongoose.model("HelpRequest", HelpRequestSchema);

// API Routes

// Victim Registration
app.post("/victim/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingVictim = await Victim.findOne({ email });
    if (existingVictim) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const newVictim = new Victim({ name, email, password });
    await newVictim.save();
    res
      .status(201)
      .json({ success: true, message: "Victim registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Officer Registration
app.post("/officer/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingOfficer = await Officer.findOne({ email });
    if (existingOfficer) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const newOfficer = new Officer({ name, email, password });
    await newOfficer.save();
    res
      .status(201)
      .json({ success: true, message: "Officer registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Victim Login
app.post("/victim/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const victim = await Victim.findOne({ email });

    if (!victim || victim.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Victim logged in",
      user: { id: victim._id, name: victim.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Officer Login
app.post("/officer/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const officer = await Officer.findOne({ email });

    if (!officer || officer.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    console.log("Officer Login Response:", {
      // Debugging Log
      success: true,
      message: "Officer logged in",
      user: { id: officer._id, name: officer.name },
    });

    res.status(200).json({
      success: true,
      message: "Officer logged in",
      user: { id: officer._id, name: officer.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get officer
app.get("/officer/:id", async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id);
    if (!officer) {
      return res
        .status(404)
        .json({ success: false, message: "Officer not found" });
    }
    res.json({ success: true, name: officer.name });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get All Pending Help Requests
app.get("/helprequests", async (req, res) => {
  try {
    const requests = await HelpRequest.find({
      assignedOfficerId: null,
    }).populate("victimId", "name");
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create a Help Request
// Emit new help request event
app.post("/helprequest", async (req, res) => {
  try {
    const { victimId, latitude, longitude } = req.body;
    const newRequest = new HelpRequest({
      victimId,
      location: { latitude, longitude },
    });
    await newRequest.save();

    io.emit("newHelpRequest", newRequest); // Notify all officers about a new request
    res.status(201).json({
      success: true,
      message: "Help request created",
      request: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Accept Help Request and notify victim
app.post("/helprequest/accept", async (req, res) => {
  try {
    const { requestId, officerId } = req.body;
    const request = await HelpRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    if (request.assignedOfficerId) {
      return res
        .status(400)
        .json({ success: false, message: "Request already accepted" });
    }

    request.assignedOfficerId = officerId;
    await request.save();

    io.emit("helpRequestAccepted", { requestId, officerId }); // 🔄 Corrected event name

    res
      .status(200)
      .json({ success: true, message: "Help request accepted", request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Resolve Help Request
app.post("/helprequest/release", async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await HelpRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    request.assignedOfficerId = null;
    await request.save();

    io.emit("updateHelpRequest", { requestId, status: "pending" });

    res.status(200).json({ success: true, message: "Request released" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("acceptHelpRequest", ({ requestId, officerId }) => {
    io.emit("helpRequestAccepted", { requestId, officerId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
