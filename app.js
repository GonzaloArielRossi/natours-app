const path = require('path');
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./helpers/appError');
const globalErrorHandler = require('./helpers/globalErrorHandler');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

const { webhookCheckout } = require('./controllers/bookingController');
// ::::::::::::::::::::::::IMPORTS END:::::::::::::::::::::::::::::

const app = express();
app.enable('trust proxy');
app.set('view engine', 'pug');

// Serve static and view files
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES

//implement CORS
app.use(cors());

app.options('*', cors());

// Secure http headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ['*']
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['*'],
        scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"]
      }
    }
  })
);

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same ip
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again later'
});
app.use('/api', limiter);

// Webhook STRIPE
app.post(
  '/webhook-checkout',
  () => console.log(':::::::::::::HERE NEGRO:::::::::::::::::::::'),
  bodyParser.raw({ type: 'application/json' }),
  webhookCheckout
);

// Body parser / Body limiter
app.use(
  express.json({
    limit: '10kb'
  })
);

// Use Cookie Parser
app.use(cookieParser());

// URL Encoder
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Use compression
app.use(compression());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// 404 Not Found
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
