const mongoose = require('mongoose')

const reviewReportSchema = new mongoose.Schema({
    reviewId : {type : String},
    accuser : {type : String},
    reportType : {type : String}
  },
  {
    timestamps: true
  })

  module.exports = mongoose.model('reviewReport', reviewReportSchema, 'reviewReport')
