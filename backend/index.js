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

    res.status(200).json({
      success: true,
      message: "Officer logged in",
      user: { id: officer._id, name: officer.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create a Help Request
app.post("/helprequest", async (req, res) => {
  try {
    const { victimId, latitude, longitude } = req.body;
    const newRequest = new HelpRequest({
      victimId,
      location: { latitude, longitude },
    });
    await newRequest.save();

    io.emit("newHelpRequest", newRequest);
    res.status(201).json({
      success: true,
      message: "Help request created",
      request: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all Help Requests (For Officers)
app.get("/helprequests", async (req, res) => {
  try {
    const requests = await HelpRequest.find({ status: "pending" }).populate(
      "victimId",
      "name"
    );
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Accept a Help Request
app.post("/helprequest/accept", async (req, res) => {
  try {
    const { requestId, officerId } = req.body;

    if (!requestId || !officerId) {
      return res.status(400).json({
        success: false,
        message: "Request ID and Officer ID are required",
      });
    }

    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Help request not found" });
    }

    if (request.assignedOfficerId) {
      return res
        .status(400)
        .json({ success: false, message: "Request already accepted" });
    }

    request.assignedOfficerId = officerId;
    await request.save();

    io.emit("helpRequestAccepted", { requestId, officerId });

    res
      .status(200)
      .json({ success: true, message: "Help request accepted", request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//release a Help Request
app.post("/helprequest/release", async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res
        .status(400)
        .json({ success: false, message: "Request ID is required" });
    }

    const request = await HelpRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    request.status = "resolved";
    await request.save();

    io.emit("helpRequestReleased", { requestId, status: "resolved" });

    res
      .status(200)
      .json({ success: true, message: "Request marked as resolved" });
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
