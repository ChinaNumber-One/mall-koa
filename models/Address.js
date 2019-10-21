const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 实例化数据模版

const AddressSchema = new Schema({
  userId: {
    type: String,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  tel: {
    type: String,
    require: true
  },
  addressDetail: {
    type: String,
    require: true
  },
  areaCode: {
    type: String,
    require: true
  },
  isDefault: {
    type: Boolean,
    require: true
  },
  address: {
    type: String
  },
  province: {
    type: String
  },
  country: {
    type: String
  },
  county: {
    type: String
  },
  city: {
    type: String
  },
  postalCode: {
    type: String
  }
})

module.exports = Address = mongoose.model('address',AddressSchema)