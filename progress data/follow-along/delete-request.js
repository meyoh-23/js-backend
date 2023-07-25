const fs = require('fs');
const express = require("express");

const app = express();

app.use(express.json()); //middle-wear

/* app.get('/', (req, res) => {
    //sending json Data format
    res.status(200).json({
    message: 'Hello from the Server side!', 
    port: `${port}`,
    app: 'Natours'}
    );
});

app.post('/', (req, res) => {
    res.send('You can post to this endpoint...');
}); */

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//get request
app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    });
});

//routing a variable
app.get('/api/v1/tours/:id', (req, res) => {
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
});

// post request
app.post('/api/v1/tours', (req, res) => {
    //middle-wear
    //console.log(req.body);
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

    //res.send("Done");
});

//patch request
app.patch('/api/v1/tours/:id', (req, res) => {
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
});

//Delete request
app.delete('/api/v1/tours/:id', (req, res) => {
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
});

const port = 3000;
//creating the server
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});