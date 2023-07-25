
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


// a middleware for top 5 cheapest tours
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage, price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next()
}
//accessing all Tours
exports.getAllTours = catchAsync(async (req, res, next) => {
        //EXECUTE THE QUERY
        const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
        const tours = await features.query;
        console.log(req.query);
        // SEND THE RESPONSE
        res.status(200).json({
            status: 'success',
            result: tours.length,
            data: {
            tours
        }
    });
})
//Accessing a single Tour
exports.getTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne(_id:req.params.id)
        if (!tour) {
            return next(new AppError('Tour with that ID does not Exist', 404))
        }
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
})

//post Operation
exports.createNewTour = catchAsync(async (req, res, next) => {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tours: newTour //accessing values already submitted to the DB
        }
    });
})
// patch operation
exports.updateTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!tour) {
            return next(new AppError('Tour with that ID does not Exist', 404))
        }

        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
})
// delete operation
exports.deleteTour = catchAsync(async (req, res, next) => {
        await Tour.findByIdAndDelete(req.params.id,)
        res.status(204).json({
            status: "success",
            data: null
        });

        if (!tour) {
            return next(new AppError('Tour with that ID does not Exist', 404))
        }
})

// aggregation pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
        const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: {$toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            },
        },
        {
            $sort: {avgPrice: 1}
        }
        ]);

        res.status(200).json({
            status: "success",
            data:{
                stats
            } 
        });
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    numTourStarts: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStarts: -1}
            },
         /*    {
                $limit: 6
            } */
        ]);

        res.status(200).json({
            status: 'success',
            result: plan.length,
            data:{
                plan
            }
        })
})