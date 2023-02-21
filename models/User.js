const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
var uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], unique: true, index: true },
  email: { type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], unique: true, index: true },
  password: { type: String, required: [true, "can't be blank"] },
}, { timestamps: true })

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.cleanup = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(this.password, salt);
  this.password = hash;
  next();
});

module.exports = mongoose.model('User', UserSchema)