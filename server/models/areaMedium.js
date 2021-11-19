const mongoose = require('mongoose')

const areaMediumSchema = new mongoose.Schema({
    belong : {type : String},
    name : {type : String}
  },
  {
    timestamps: true
  })

  module.exports = mongoose.model('areaMedium', areaMediumSchema, 'areaMedium')