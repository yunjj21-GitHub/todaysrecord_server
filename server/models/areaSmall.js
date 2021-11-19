const mongoose = require('mongoose')

const areaSmallSchema = new mongoose.Schema({
    belong : {type : String},
    name : {type : String}
  },
  {
    timestamps: true
  })

  module.exports = mongoose.model('areaSmall', areaSmallSchema, 'areaSmall')