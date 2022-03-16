const mongoose = require('mongoose')

// Define Schemes
const photostudioSchema = new mongoose.Schema({
  area : {type : Array},
  type : {type : String},
  name: { type: String },
  address: { type: String },
  cost: { type: Number },
  image: { type: Array },
  phoneNumber: { type: String },
  siteAddress: { type: String },
  instergramId: { type: String },
  intro : {type : String},
  location : {type : Array},
  interested : {type : Array}
},
{
  timestamps: true
})

// Create Model & Export
module.exports = mongoose.model('photostudio', photostudioSchema, 'photostudio')