const mongoose = require('mongoose')

const areaLargeSchema = new mongoose.Schema({
    name : {type : String}
  },
  {
    timestamps: true
  })

  module.exports = mongoose.model('areaLarge', areaLargeSchema, 'areaLarge')