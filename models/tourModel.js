const mongoose = require('mongoose');
const slugify = require('slugify');


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour Must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'tour name should not exceed 40 charecters long'],
        minlength: [10, 'tour name sholud be at least 10 characters long']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour Must Have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Maximum number allowed for the toue must be provided']
    },
    difficulty: {
        type: String,
        required: [true, 'You have to provide the difficulty for a tour'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: `'difficulty' can only be specified as easy, 'medium' or 'difficult'`
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'the lowest rating you can provide is 1.0'], 
        max: [5, 'rating should not be higher than 5.o']
    },
    ratingsQuantity: {
        type:Number,
        default:0
    },
    price: {
        type: Number,
        required: [true, 'A tour price has to be specified']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < (0.3 * this.price);
            },
            message: 'A tour cannot have a discount greator than 30%'
        }
    },
    summery: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        requird: [true, 'A tour must have a description']
    },
    imageCover: {
        type:String,
        required: [true, 'A tour must have a cover photo']
    },
    image: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates:[Date],
    secretTour:{
        type: Boolean,
        default: false
    }, 
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);
// virtual property
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
});
// DOCUMENT MIDDLEWARE: runs before the .save() and .create() - does not run with insertMany()
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true });
    next();
});

/* tourSchema.pre('save', function(next){
    console.log('Will be saving the document now....');
    next();
})
// post document middleware has access to the document already saved as well as the next. this cannot be accessed in this function
tourSchema.post('save', function(doc, next) {
    console.log(doc);
    next()
}) */
// pre QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: {$ne: true} });
    this.start = Date.now();
    next()
});

// post QUERY MIDDLEWARE - runs after the query has been executed
tourSchema.post(/^find/, function(doc, next){
    console.log(`query took ${Date.now() - this.start} milliseconds to execute`)
    next();
});
// AGGREGATION MIDDLEWARE -- to prevent secretTour from being accessed in the aggregation
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: {$ne: true} } })
    //console.log(this);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;