const mongoose = require('mongoose');

const AuthoritySchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },               
  email: { type: String, required: true }              
});

module.exports = mongoose.model('Authority', AuthoritySchema);