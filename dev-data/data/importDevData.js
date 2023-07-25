const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

//connecting to the local MongoDB server
// the object is passed to eliminate some deprication warnings
mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() =>  console.log('DB connection Succcessful'));

    //read the data from the JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'));

// import data to the database
const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('Data successfully loaded to DB');
        process.exit();
    } catch (error) {
        console.log(error.message)
    }
}

// Delete all collection from the DB
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('Data Deleted Successfully from the DB');
        process.exit()
    } catch (error) {
        console.log(error.message)
    }
};

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}

console.log(process.argv);