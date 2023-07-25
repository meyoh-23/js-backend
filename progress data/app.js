const express = require("express");
const morgan = require('morgan');
const tourRouter = require('./routers/tourRouters');
const userRouter = require('./routers/userRouter');

const app = express();

//MIDDLEWEARS
app.use(morgan('dev'))
app.use(express.json()); //middle-wear

//Gobal middlewear. will be accessed by all route handlers since its postitioned before all route handlers
app.use((req, res, next) => {
    console.log('Hello from the middlewear 👋');
    next();
});

//another request implementation
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//mounting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;