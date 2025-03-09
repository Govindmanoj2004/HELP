const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));

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

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

// Schemas
const VictimSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: {
    type: String,
    required: true,
    minLength: 5,
  },
  createdAt: { type: Date, default: Date.now },
});

const OfficerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const VictimLocationSchema = new mongoose.Schema({
  victimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Victim",
    required: true,
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
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

const ChatSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HelpRequest",
    required: true,
  },
  victimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Victim",
    required: true,
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officer",
    required: true,
  },
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Sender (victim/officer)
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Models
const Victim = mongoose.model("Victim", VictimSchema);
const Officer = mongoose.model("Officer", OfficerSchema);
const VictimLocation = mongoose.model("VictimLocation", VictimLocationSchema);
const HelpRequest = mongoose.model("HelpRequest", HelpRequestSchema);
const Chat = mongoose.model("Chat", ChatSchema);

//Api
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
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({ success: true, message: "Victim logged in", user: { id: victim._id, name: victim.name } });

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
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({ success: true, message: "Officer logged in", user: { id: officer._id, name: officer.name } });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
