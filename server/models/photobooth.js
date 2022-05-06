const mongoose = require('mongoose')

const photoboothSchema = new mongoose.Schema({
    brand : {type : String},
    name : {type : String},
    address : {type : String},
    location : {type : Array}
  },
  {
    timestamps: true
  })

  module.exports = mongoose.model('photobooth', photoboothSchema, 'photobooth')