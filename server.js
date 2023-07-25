const dotenv = require('dotenv');
const mongoose = require('mongoose');

// handling uncought Exeptions -should be placed at the very top
process.on('uncaughtException', error=>{
  console.log('UNCOUGHT EXEPTIONS! 🔥🔥🔥🔥🔥, shutting down ...');
  console.log(error.name, error.message);
  console.log(error.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app'); //importing app

//connecting to the local MongoDB server
// the object is passed to eliminate some deprication warnings
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() =>  console.log('DB connection Succcessful'));

const port = process.env.PORT; //creating the server requires a port
const server = app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});
// GLOBALLY HANDLING UNHANDLED PROMISE REJECTIONS
// Use event listner or event emmiters to listen to unhandled rejection
process.on('unhandledRejection', error =>{
  console.log(error.name, error.message, error.stack);
  console.log('UNHANDLED REJECTIONS 🔥🔥🔥🔥🔥, Shutting down...');
  server.close(() =>{
    process.exit(1);
  });
});

