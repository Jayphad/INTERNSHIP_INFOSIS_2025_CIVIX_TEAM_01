const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
   role: { 
    type: String, 
    enum: ['citizen', 'official'], 
    default: 'citizen' },
  latitude: { 
    type: Number, 
    default: null },
  longitude: { 
    type: Number, 
    default: null },

    // New fields
  approved: { type: Boolean, default: false }, // only for officials
  isSuperAdmin: { type: Boolean, default: false } // only for super admin

});

const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;
