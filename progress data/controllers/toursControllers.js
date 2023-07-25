const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//accessing all Tours
exports.getAllTours = (req, res) => {
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
exports.getTour = (req, res) => {
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
exports.createNewTour = (req, res) =>{
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
exports.updateTour = (req, res) => {
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
exports.deleteTour = (req, res) => {
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