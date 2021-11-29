const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError} = require('../errors')
const path = require('path')


const createProduct = async (req, res) => {
    req.body.user = req.user.userID
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
}

const getAllProducts = async (req, res) => {
    const product = await Product.find({})
    res.status(StatusCodes.OK).json({count: product.length, product})
}

const getSingleProduct = async (req, res) => {
    const productId = req.params.id
    const product = await Product.findOne({_id: productId})
    if (!product) {
        throw new NotFoundError(`No product with id: ${productId}`)
    }
    res.status(StatusCodes.OK).json({product})
}

const updateProduct = async (req, res) => {
    const productId = req.params.id
    const product = await Product.findOneAndUpdate({_id: productId}, req.body, {new: true, runValidators: true})
    if (!product) {
        throw new NotFoundError(`No product with id: ${productId}`)
    }
    res.status(StatusCodes.OK).json({msg: 'Product updated'})
}

const deleteProduct = async (req, res) => {
    const productId = req.params.id
    /* const product = await Product.findOneAndDelete({_id: productId})
    if (!product) {
        throw new NotFoundError(`No product with id: ${productId}`)
    }
    res.status(StatusCodes.OK).json({msg: 'Product deleted'}) */

    const product = await Product.findOne({_id: productId})
    if (!product) {
        throw new NotFoundError(`No product with id: ${productId}`)
    }
    await product.remove()
    res.status(StatusCodes.OK).json({msg: 'Product deleted'})
}

const uploadImage = async (req, res) => {
    if (!req.files) {
        throw new BadRequestError('No files uploaded')
    }
    
    const image = req.files.image

    if (!image.mimetype.startsWith('image')) {
        throw new BadRequestError('Please provide a image')
    }

    const maxSize = 1024 * 1024

    if (image.size > maxSize) {
        throw new BadRequestError('Please provide image smaller than 1MB')
    }

    const imagePath = path.join(__dirname, '../public/', image.name)
    await image.mv(imagePath)
    res.status(StatusCodes.OK).json({image: {src: `/public/${image.name}`}})
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}