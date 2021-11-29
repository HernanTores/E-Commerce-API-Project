const Order = require('../models/Order')
const Product = require('../models/Product')
const {BadRequestError, NotFoundError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const {checkPermissions} = require('../utils')

const fakeStripeAPI = async ({amount, currency}) => {
    const client_secret = 'randomValue'
    return {client_secret, amount}
}

const createOrder = async (req, res) => {
    const {items: cartItems, tax, shippingFee} = req.body

    if (!cartItems || cartItems.length < 1) {
        throw new BadRequestError('No cart items provided')
    }

    if (!tax || !shippingFee) {
        throw new BadRequestError('Please provide tax and shippingFee')
    }

    let orderItems = []
    let subtotal = 0

    for (const item of cartItems) {
        const dbProduct = await Product.findOne({_id: item.product})

        if (!dbProduct) {
            throw new NotFoundError(`No product with id: ${item.product}`)
        }

        const {name, price, image, _id} = dbProduct
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id
        }
        orderItems = [...orderItems, singleOrderItem]
        subtotal += item.price * item.amount
    }
    const total = subtotal + tax + shippingFee

    const paymentIntent = await fakeStripeAPI({amount: total, currency: 'usd'})

    const order = await Order.create({orderItems, total, subtotal, tax, shippingFee, clientSecret: paymentIntent.client_secret, user: req.user.userID})
    res.status(StatusCodes.CREATED).json({order, clientSecret: order.client_secret})
}

const getAllOrders = async (req, res) => {
    const order = await Order.find({})
    res.status(StatusCodes.OK).json({count: order.length, order})
}

const getSingleOrder = async (req, res) => {
    const orderId = req.params.id
    const order = await Order.findOne({_id: orderId})
    checkPermissions(req.user, order.user)
    
    if (!order) {
        throw new NotFoundError(`No order with id: ${orderId}`)
    }

    res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async (req, res) => {
    const currentUserOrder = req.user.userID
    const order = await Order.find({user: currentUserOrder})
    res.status(StatusCodes.OK).json({count: order.length, order})
}

const updateOrder = async (req, res) => {
    const orderId = req.params.id
    const {paymentIntentId} = req.body

    const order = await Order.findOne({_id: orderId})
    if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`)
    }
    checkPermissions(req.user, order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({order})
}


module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder
}