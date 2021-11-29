const User = require('../models/User')
const {NotFoundError, BadRequestError, UnauthenticatedError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const { attachCookiesToRespose, createTokenUser, checkPermissions } = require('../utils')

const getAllUsers = async (req, res) => {
    const users = await User.find({role: 'user'}).select('-password')
    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req, res) => {
    const userID = req.params.id
    const user = await User.findOne({_id: userID}).select('-password')

    if (!user) {
        throw new NotFoundError(`No user with id: ${userID}`)
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async (req, res) => {
    const currentUser = req.user
    res.status(StatusCodes.OK).json({currentUser})
}

const updateUser = async (req, res) => {
    const {name, email} = req.body
    const {userID} = req.user
    
    if (!name || !email) {
        throw new BadRequestError('Please provide name and email')
    }

    /* const user = await User.findOne({_id: userID})

    user.name = name
    user.email = email

    await user.save()

    const tokenUser = createTokenUser(user)

    attachCookiesToRespose(res, tokenUser)

    res.status(StatusCodes.OK).json({user: tokenUser}) */

    const user = await User.findOneAndUpdate({_id: userID}, {name, email}, {new: true, runValidators: true})

    const tokenUser = createTokenUser(user)
    attachCookiesToRespose(res, tokenUser)
    res.json({user: tokenUser})
}

const updateUserPassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body

    if (!oldPassword || !newPassword) {
        throw new BadRequestError('Please provide both password')
    }

    const user = await User.findOne({_id: req.user.userID})

    if (!user) {
        throw new NotFoundError(`No user with id: ${req.user.userID}`)
    }

    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials')
    }

    user.password = newPassword

    await user.save()

    res.status(StatusCodes.OK).json({msg:'Password updated'})
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}