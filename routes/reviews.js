const express = require('express')
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const Review = require('../models/review');
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressErrors');



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))


router.delete('/:reviewId', isReviewAuthor, isLoggedIn, catchAsync(reviews.deleteReview))


module.exports = router;