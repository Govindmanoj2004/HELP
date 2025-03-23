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
      "mongodb+srv://test:test123@cluster0.mn5z1.mongodb.net/test",
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

    // Get the socket IDs for the victim and officer
    const victimSocketId = connectedVictims.get(request.victimId.toString());
    const officerSocketId = connectedOfficers.get(officerId.toString());

    // Notify the victim
    if (victimSocketId) {
      io.to(victimSocketId).emit("helpRequestAccepted", {
        requestId,
        officerId,
      });
    }

    // Notify the officer
    if (officerSocketId) {
      io.to(officerSocketId).emit("helpRequestAccepted", {
        requestId,
        officerId,
      });
    }

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
    request.status = "resolved";
    await request.save();

    io.emit("updateHelpRequest", {
      requestId,
      status: request.status,
      officerId: null,
    });

    res
      .status(200)
      .json({ success: true, message: "Request released", request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//socket
//govin

// Track socket IDs for victims and officers
const connectedVictims = new Map();
const connectedOfficers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a victim connects
  socket.on("victimConnected", (userId) => {
    connectedVictims.set(userId, socket.id);
    console.log(`Victim ${userId} connected with socket ID: ${socket.id}`);
  });

  // When an officer connects
  socket.on("officerConnected", (userId) => {
    connectedOfficers.set(userId, socket.id);
    console.log(`Officer ${userId} connected with socket ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove the disconnected user from the maps
    for (const [userId, sockId] of connectedVictims.entries()) {
      if (sockId === socket.id) {
        connectedVictims.delete(userId);
        console.log(`Victim ${userId} disconnected`);
        break;
      }
    }

    for (const [userId, sockId] of connectedOfficers.entries()) {
      if (sockId === socket.id) {
        connectedOfficers.delete(userId);
        console.log(`Officer ${userId} disconnected`);
        break;
      }
    }
  });

  socket.on("joinChat", async (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);

    // Split the chatId into userId and officerId
    const [userId, officerId] = chatId.split("_");

    // Check for existing chats with the same userId and officerId
    const existingChats = await Chat.find({ userId, officerId });

    // If duplicates exist, delete them (keep only the first one)
    if (existingChats.length > 1) {
      const chatsToDelete = existingChats.slice(1); // Keep the first chat, delete the rest
      const deletePromises = chatsToDelete.map((chat) =>
        Chat.deleteOne({ _id: chat._id })
      );
      await Promise.all(deletePromises);
      console.log(`Deleted ${chatsToDelete.length} duplicate chats.`);
    }

    // Find or create the chat document
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $setOnInsert: {
          _id: chatId,
          userId,
          officerId,
          messages: [],
        },
      },
      { upsert: true, new: true }
    );

    // Send previous messages to the client
    socket.emit("previousMessages", chat.messages);
  });

  socket.on("sendMessage", async ({ chatId, sender, message }) => {
    const chat = await Chat.findById(chatId);
    if (chat) {
      // Add the new message to the messages array
      chat.messages.push({ sender, message });
      await chat.save();

      // Broadcast the message to the chat room
      io.to(chatId).emit("newMessage", {
        id: Date.now(),
        sender,
        text: message,
      });
    }
  });
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

//Get for victims

app.get("/victim/:id", async (req, res) => {
  try {
    const victim = await Victim.findById(req.params.id);
    if (!victim) {
      return res.status(404).json({ message: "Victim not found" });
    }
    res.status(200).json([victim]); // Wrap the response in an array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update victim
app.put("/victim/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updatedVictim = await Victim.findByIdAndUpdate(
      req.params.id,
      { name, email, password },
      { new: true } // Return the updated document
    );
    if (!updatedVictim) {
      return res.status(404).json({ message: "Victim not found" });
    }
    res.status(200).json(updatedVictim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//anonymus sos
const anonymusSOS = new mongoose.Schema({
  location: {
    type: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const AnonymusSos = mongoose.model("AnonymusSos", anonymusSOS);

// POST endpoint to save SOS request
app.post("/anonymusSos", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate location data
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    const newAnonymusSos = new AnonymusSos({
      location: { latitude, longitude },
    });

    await newAnonymusSos.save();

    res.status(201).json({
      success: true,
      message: "Anonymous SOS created",
      sos: newAnonymusSos,
    });
  } catch (error) {
    console.error("Error saving SOS request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get anonymusSOS only in 24hr
app.get("/anonymusSos", async (req, res) => {
  try {
    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch SOS requests created within the last 24 hours
    const sos = await AnonymusSos.find({
      timestamp: { $gte: twentyFourHoursAgo },
    });

    res.status(200).json(sos);
  } catch (error) {
    console.error("Error fetching anonymous SOS requests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get officer by id
app.get("/officerProfile/:officerId", async (req, res) => {
  try {
    const officerId = req.params.officerId;
    const officer = await Officer.findById(officerId);

    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    res.status(200).json(officer);
  } catch (error) {
    console.error("Error fetching officer data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//update officer
app.put("/officerProfile/:officerId", async (req, res) => {
  try {
    const officerId = req.params.officerId;
    const { name, email, password } = req.body;

    const updatedOfficer = await Officer.findByIdAndUpdate(
      officerId,
      { name, email, password },
      { new: true }
    );

    if (!updatedOfficer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    res.status(200).json(updatedOfficer);
  } catch (error) {
    console.error("Error updating officer data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//chatRoom
const chatSchema = new mongoose.Schema({
  _id: {
    type: String, // Use String instead of ObjectId
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officer",
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ["user", "officer"],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

//District
const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});
const District = mongoose.model("District", districtSchema);

//place
const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
});
const Place = mongoose.model("Place", placeSchema);

const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
    required: true,
  },
});
const Shelter = mongoose.model("Shelter", shelterSchema);

// api shelter

// Add District
app.post("/api/districts", async (req, res) => {
  try {
    const { name } = req.body;

    // Check if district already exists
    const existingDistrict = await District.findOne({ name });
    if (existingDistrict) {
      return res.status(400).json({ message: "District already exists" });
    }

    // Create new district
    const newDistrict = new District({ name });
    await newDistrict.save();

    res
      .status(201)
      .json({ message: "District added successfully", newDistrict });
  } catch (error) {
    console.error("Error adding district:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add Place
app.post("/api/places", async (req, res) => {
  try {
    const { name, districtId } = req.body;

    // Check if district exists
    const district = await District.findById(districtId);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    // Check if place already exists
    const existingPlace = await Place.findOne({ name });
    if (existingPlace) {
      return res.status(400).json({ message: "Place already exists" });
    }

    // Create new place
    const newPlace = new Place({ name, districtId });
    await newPlace.save();

    res.status(201).json({ message: "Place added successfully", newPlace });
  } catch (error) {
    console.error("Error adding place:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add Shelter
app.post("/api/shelters", async (req, res) => {
  try {
    const { name, districtId, placeId } = req.body;

    // Check if district exists
    const district = await District.findById(districtId);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    // Check if place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    // Check if shelter already exists
    const existingShelter = await Shelter.findOne({ name });
    if (existingShelter) {
      return res.status(400).json({ message: "Shelter already exists" });
    }

    // Create new shelter
    const newShelter = new Shelter({ name, districtId, placeId });
    await newShelter.save();

    res.status(201).json({ message: "Shelter added successfully", newShelter });
  } catch (error) {
    console.error("Error adding shelter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Get
// Fetch all districts
app.get("/districts", async (req, res) => {
  try {
    const districts = await District.find();
    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// Fetch all places
app.get("/places", async (req, res) => {
  try {
    const places = await Place.find().populate("districtId", "name");
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

// Fetch all shelters
app.get("/shelters", async (req, res) => {
  try {
    const shelters = await Shelter.find()
      .populate("districtId", "name")
      .populate("placeId", "name");
    res.status(200).json(shelters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shelters" });
  }
});

// counsellorSchema
const counsellorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Counsellor = mongoose.model("Counsellor", counsellorSchema);

const bookingSchema = new mongoose.Schema({
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Counsellor",
    required: true,
  },
  bookingDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["booked", "accepted", "resolved","reject"],
    default: "booked",
  },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const Booking = mongoose.model("Booking", bookingSchema);

//reg
app.post("/counsellorReg", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if the email is already registered
    const existingCounsellor = await Counsellor.findOne({ email });
    if (existingCounsellor) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Create a new counsellor instance
    const newCounsellor = new Counsellor({ name, email, password });

    // Save the new counsellor to the database
    await newCounsellor.save();

    // Respond with success message
    res
      .status(201)
      .json({ success: true, message: "Counsellor registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//login
app.post("/counsellorLogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const counsellor = await Counsellor.findOne({ email });
    if (!counsellor || counsellor.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    res.status(200).json({
      success: true,
      message: "Counsellor logged in",
      user: { id: counsellor._id, name: counsellor.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API to get all counsellors
app.get("/counsellors", async (req, res) => {
  try {
    const counsellors = await Counsellor.find({});
    res.json(counsellors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//post booking
app.post("/booksession", async (req, res) => {
  try {
    const { counsellorId, bookingDate, userId } = req.body;

    // Validate if the counsellor exists
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) {
      return res.status(404).json({ message: "Counsellor not found" });
    }

    // Create a new booking
    const newBooking = new Booking({
      counsellorId,
      bookingDate: new Date(bookingDate), // Ensure the date is in a valid format
      userId,
    });

    // Save the booking to the database
    await newBooking.save();

    // Respond with the created booking
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//all bookings of counsellor
app.get("/bookings/:counsellorId", async (req, res) => {
  try {
    const counsellorId = req.params.counsellorId;
    const bookings = await Booking.find({ counsellorId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/user-sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Find all booking sessions for this user
    const userSessions = await Booking.find({ userId })
      .sort({ bookingDate: -1 }) // Sort by booking date, newest first
      .populate('counsellorId', 'name email'); // Optionally populate counsellor details
    
    // Process the data to include counsellor name if it's not already included
    const processedSessions = userSessions.map(session => {
      // If the session doesn't have counsellorName but has populated counsellorId
      if (!session.counsellorName && session.counsellorId && session.counsellorId.name) {
        return {
          ...session.toObject(),
          counsellorName: session.counsellorId.name
        };
      }
      return session;
    });
    
    res.status(200).json(processedSessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//update status
app.patch('/bookings/:id', async (req, res) => {
  try {
    // Validate the status is one of the allowed values
    if (req.body.status && !['booked', 'accepted', 'resolved', 'reject'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: 'Error updating booking', error: error.message });
  }
});
