const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize =require('express-mongo-sanitize'); // prevent non-sql attack
const xss = require('xss-clean');
const hpp = require('hpp'); // http parameter pollution

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRouters');
const userRouter = require('./routers/userRouter');

const app = express();

// global middleware
//MIDDLEWEARS
app.use(helmet()); // security http headers

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// implementing rate limiter
const limiter = rateLimit({
  // only 100 requests can be send from the same IP in one hour
  max: 100,
  windowMs: 60 *60 *1000,
  message: 'too many requests from this IP, plsease try again after one hour!'
});

app.use('/api', limiter); // rate limiter

// body-parser - reading data from the body into req.body
app.use(express.json({limit:'10kb'}));

// DATA SANITIZATION - against noSQL attack
app.use(mongoSanitize());

// DATA SANITIZATION -against xxs - clean all user input from malicious html code
app.use(xss());

// prevent parameter pollution by clearing-up the query string
app.use(hpp({
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

 //serving static file
app.use(express.static(`${__dirname}/public`));

// TEST MIDDLEWARE - hepls in debugging process
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

//mounting the routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// handling all the unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// ERROR HANLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
