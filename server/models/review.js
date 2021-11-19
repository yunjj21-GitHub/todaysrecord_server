const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    psId : {type : String},
    userId : {type : String},
    rating : {type : Number},
    content : {type : String},
    image : {type : String}
  },
  {
    timestamps: true
  })

  module.exports = mongoose.model('review', reviewSchema, 'review')