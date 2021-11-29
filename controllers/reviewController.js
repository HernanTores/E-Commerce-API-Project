const Review = require('../models/Review')
const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const {NotFoundError, BadRequestError, UnauthorizedError} = require('../errors')
const {checkPermissions} = require('../utils')

const createReview = async (req, res) => {
    const productId = req.body.product
    const isProductValid = await Product.findOne({_id: productId})

    if (!isProductValid) {
        throw new NotFoundError(`No product with id: ${productId}`)
    }

    const alreadySubmitted = await Review.findOne({product: productId, user: req.user.userID})
    
    if (alreadySubmitted) {
        throw new BadRequestError('Already submited review for this product')
    }
    req.body.user = req.user.userID
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

const getAllReviews = async (req, res) => {
    const review = await Review.find({}).populate({path: 'product', select: 'name company price'})
    res.status(StatusCodes.OK).json({count: review.length, review})
}

const getSingleReview = async (req, res) => {
    const reviewId = req.params.id
    const review = await Review.findOne({_id: reviewId})
    if (!review) {
        throw new NotFoundError(`No review with id: ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({review})
}

const updateReview = async (req, res) => {
    const reviewId = req.params.id
    const {rating, title, comment} = req.body

    if (!rating || !title || !comment) {
        throw new BadRequestError('Please provide rating, title, and comment')
    }

    const review = await Review.findOne({_id: reviewId})

    if (!review) {
        throw new NotFoundError(`No review with id: ${reviewId}`)
    }

    checkPermissions(req.user, review.user)

    review.rating = rating
    review.title = title
    review.comment = comment

    review.save()
    res.status(StatusCodes.OK).json({msg: 'Review updated', review})
}

const deleteReview = async (req, res) => {
    const reviewId = req.params.id

    
    const review = await Review.findOne({_id: reviewId})
    
    if (!review) {
        throw new NotFoundError(`No review with id: ${reviewId}`)
    }
    
    checkPermissions(req.user, review.user)
    await review.remove()

    res.status(StatusCodes.OK).json({msg: 'Review deleted'})
}

const getSingleProductReviews = async (req, res) => {
    const reviewId = req.params.id
    const review = await Review.find({product: reviewId})
    res.status(StatusCodes.OK).json({count: review.length, review})
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
}