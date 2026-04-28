const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  type: String,         // e.g., "Pothole"
  severity: String,     // e.g., "High"
  description: String,
  location: String,     // The city/address
  userName: String,     // The person reporting it
  authorityEmail: String, // Who it was sent to
  status: { 
    type: String, 
    default: "Pending"  // Status for the Public Board
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);