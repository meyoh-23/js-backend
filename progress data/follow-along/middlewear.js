const fs = require('fs');
const express = require("express");

const app = express();
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

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//accessing all Tours
const getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        result: tours.length,
        data: {
            tours
        }
    });
}

//Accessing a single Tour
const getTour = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1; //convert id from string to number

    if (id > tours.length) {
       /*  if (!tour) { */  // ana alternative implementation of the previous line
        return res.status(404).json({
            status: "fail",
            message: "Invalid Id"
        })
    }

    const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: 'success',
        //result: tours.length,
        data: {
            tour
        }
    });
}

//post Operation
createNewTour = (req, res) =>{
    //middle-wear
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id: newId}, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    });
} 

// patch operation
const updateTour = (req, res) => {
    //validation  for update condition
    if (req.params.id * 1 > tours.length) {
        return res.status(400).json({
            status: "fail",
            message: "Invalid ID"
        })
    }

    res.status(200).json({
        status: "success",
        data: {
            tour: '<Updated Tour here >'
        }
    });
}

// delete operation
const deleteTour = (req, res) => {
    //validation  for update condition
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        })
    }

    res.status(204).json({
        status: "success",
        data: null
    });
}

/* app.get('/api/v1/tours', getAllTours); //get request
app.get('/api/v1/tours/:id', getTour); //routing a variable
app.post('/api/v1/tours', createNewTour); // post request
app.patch('/api/v1/tours/:id', updateTour); //patch request
app.delete('/api/v1/tours/:id', deleteTour); //Delete request */

app
.route('/api/v1/tours')
.get( getAllTours)
.post(createNewTour);

app
.route('/api/v1/tours/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour);

//creating the server
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});