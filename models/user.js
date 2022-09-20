const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
    maxlength: [40, 'A user name must have less or equal than 40 characters'],
    minlength: [10, 'A user name must have at least 10 characters']
  },
  email: {
    type: String,
    require: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provida a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  pwd: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  pwdConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 8,
    validate: {
      // this only works on create and save! Not in findByIdAndUpdate
      validator: function(el) {
        return el === this.pwd;
      },
      message: 'Passwords do not match'
    }
  },
  pwdChangedAt: {
    type: Date
  },
  role: {
    type: String,
    enum: ['user', 'guide', ' lead-guide', 'admin'],
    default: 'user'
  },
  pwdResetToken: {
    type: String
  },
  pwdResetExpires: {
    type: Date
  },
  active: {
    type: Boolean,
    dafault: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('pwd')) {
    return next();
  }
  this.pwd = await bcrypt.hash(this.pwd, 12);
  this.pwdConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('pwd') || this.isNew) {
    return next();
  }
  this.pwdChangedAt = Date.now() - 2000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPwd = async function(candidatePwd, userPwd) {
  return await bcrypt.compare(candidatePwd, userPwd);
};
userSchema.methods.changedPwdAfter = function(JWTTimestamp) {
  if (this.pwdChangedAt) {
    const changedTimestamp = parseInt(this.pwdChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.pwdResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.pwdResetExpires = Date.now() + 10 * 60 * 100;

  return resetToken;
};

module.exports = model('User', userSchema);
