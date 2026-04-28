require('dotenv').config();
// const dns = require('dns');
// dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Added mongoose
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Authority = require('./models/Authority');
const Complaint = require('./models/Complaint');

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const app = express();

// Database Connection (CRITICAL: You need this to talk to MongoDB)
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch(err => console.error("❌ DB Connection Error:", err));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SnapFix Backend is live!' });
});

// Analyze Image
app.post('/analyze', async (req, res) => {
  try {
    let { base64Image } = req.body;
    if (!base64Image) return res.status(400).json({ error: "No image provided" });

    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const prompt = "Analyze this image of public infrastructure damage. Classify as: Pothole, Open Drain, Broken Light, or Other. Rate severity: Low, Medium, or High. Return strictly JSON: { 'type': '...', 'severity': '...', 'description': '...' }";

    const imagePart = {
      inlineData: { data: cleanBase64, mimeType: "image/jpeg" }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

// Generate Complaint Letter
app.post('/generate-complaint', async (req, res) => {
  try {
    const { type, severity, description, location, userName } = req.body;
    if (!type || !location) return res.status(400).json({ error: "Missing info" });

    const prompt = `Write a formal, firm, and professional complaint letter. Sender: ${userName || "A concerned citizen"}, Location: ${location}, Type: ${type}, Severity: ${severity}, Description: ${description}. Return strictly JSON: { "subject": "...", "body": "..." }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("Letter Generator Error:", error);
    res.status(500).json({ error: "Failed to draft letter" });
  }
});

// Get Authority (CLEANED UP VERSION)
app.post('/get-authority', async (req, res) => {
  try {
    const { city } = req.body;
    
    // Attempt to find the specific city in your DB
    const authority = await Authority.findOne({ city: city });

    if (!authority) {
      // Fallback for demo purposes if city isn't found
      return res.json({ 
        name: "General Municipal Body", 
        email: "demo-complaints@snapfix.in",
        isDemo: true 
      });
    }

    res.json(authority);
  } catch (error) {
    console.error("DB lookup failed:", error);
    res.status(500).json({ error: "DB lookup failed" });
  }
});




// SAVE a new complaint
app.post('/save-complaint', async (req, res) => {
  try {
    const complaintData = req.body;
    const newComplaint = new Complaint(complaintData);
    await newComplaint.save();
    res.status(201).json({ message: "Complaint logged on Public Board!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save to database" });
  }
});

// GET all complaints for the Public Board
app.get('/complaints', async (req, res) => {
  try {
    const allComplaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(allComplaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chugging along on port ${PORT}`);
});