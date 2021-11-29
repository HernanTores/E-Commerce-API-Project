const User = require('../models/User')
const {BadRequestError, UnauthenticatedError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const {attachCookiesToRespose, createTokenUser} = require('../utils')

const register = async (req, res) => {
    const {name, email, password} = req.body

    const emailAlreadyExists = await User.findOne({email})

    if (emailAlreadyExists) {
        throw new BadRequestError('Email already exists')
    }

    const isFirstUser = await User.countDocuments({}) === 0

    const role = isFirstUser ? 'admin' : 'user'

    const user = await User.create({name, email, password, role})

    const tokenUser = createTokenUser(user)

    attachCookiesToRespose(res, tokenUser)

    res.status(StatusCodes.CREATED).json({newUser: tokenUser})
}

const login = async (req, res) => {
    const {email, password} = req.body

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({email})

    if (!user) {
        throw new UnauthenticatedError('Invalid credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials')
    }

    const tokenUser = createTokenUser(user)

    attachCookiesToRespose(res, tokenUser)

    res.status(StatusCodes.OK).json({user: tokenUser})
}

const logout = async (req, res) => {
    res.cookie('token', 'logout',{httpOnly: true, expires: new Date(Date.now())})
    res.send('logout')
}

module.exports = {
    register,
    login,
    logout
}