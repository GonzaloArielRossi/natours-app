const AppError = require('../helpers/appError');
const catchAsync = require('../helpers/catchAsync');
const crypto = require('crypto');
const Email = require('../helpers/email');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.pwd = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    pwd: req.body.pwd,
    pwdConfirm: req.body.pwdConfirm,
    pwdChangedAt: req.body.pwdChangedAt
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, pwd } = req.body;

  // Fields missing in req
  if (!email || !pwd) {
    return next(new AppError(' Please provide email and password', 400));
  }

  // User exists?
  const user = await User.findOne({ email }).select('+pwd');

  //Correct pwd?
  if (!user || !(await user.correctPwd(pwd, user.pwd))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //Login Succesfull
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPwdAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPwdAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`you don't have permission to perform this action`, 403)
      );
    }
    next();
  };
};

exports.forgotPwd = catchAsync(async (req, res, next) => {
  //get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`There's no user with that email address`, 404));
  }
  // Generate random reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Send it to users mail
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}`;

  try {
    await new Email(user, resetURL).sendPwdReset();

    res.status(200).json({
      status: 'success',
      message: 'Token Sent to Email'
    });
  } catch (err) {
    user.pwdResetToken = undefined;
    user.pwdResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`Error sending email`, 500));
  }
});

exports.resetPwd = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    pwdResetToken: hashedToken,
    pwdResetExpire: { $gt: Date.now() }
  });
  //if token is not expired and there is a user, set new pwd
  if (!user) {
    return next(new AppError(`Token is invalid or has expired`, 500));
  }
  user.pwd = req.body.pwd;
  user.pwdConfirm = req.body.pwdConfirm;
  user.pwdResetExpires = undefined;
  user.pwdResetToken = undefined;

  // update changedPasswordAt
  await user.save();
  // log the username, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePwd = catchAsync(async (req, res, next) => {
  //get user
  const user = await User.findById(req.user.id).select('+pwd');
  //check if pwd is correct
  if (!(await user.correctPwd(req.body.pwdCurrent, user.pwd))) {
    return next(new AppError(`Your password is wrong`, 401));
  }
  //update pwd
  user.pwd = req.body.pwd;
  user.pwdConfirm = req.body.pwdConfirm;
  await user.save();
  // log user in, send JWT
  createSendToken(user, 200, req, res);
});
