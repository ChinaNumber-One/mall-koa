const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化数据模版

const UserSchema = new Schema({
  name:{
    type:String,
    required:true
  },
  phone:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  avatar: {
    type:String,
  },
  sex: {
    type:String
  },
  birth: {
    type:String
  },
  areaText: {
    type:String
  },
  areaCode: {
    type:String
  },
  date:{
    type:Date,
    default:Date.now
  }
})

module.exports = User = mongoose.model('user',UserSchema)