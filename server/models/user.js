const mongoose = require('mongoose')

// Define Schemes
const userSchema = new mongoose.Schema({
  nickname : { type: String },
  profileImage : {type : String},
  email : {type : String}
},
{
  timestamps: true
})

module.exports = mongoose.model('user', userSchema, 'user')