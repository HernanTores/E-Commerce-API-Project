const jwt = require('jsonwebtoken')

const createToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    return token
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

const attachCookiesToRespose = (res, user) => {
    const token = createToken(user)

    const oneDay = 1000 * 60 * 60 * 24
    res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + oneDay), secure: process.env.NODE_ENV === 'production', signed: true})
}


module.exports = {
    createToken,
    verifyToken,
    attachCookiesToRespose
}