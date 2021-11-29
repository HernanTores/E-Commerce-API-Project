const {UnauthenticatedError, UnauthorizedError} = require('../errors')
const {verifyToken} = require('../utils')

const authenticateUser = (req, res, next) => {
    const token = req.signedCookies.token

    if (!token) {
        throw new UnauthenticatedError('Invalid credentials')
    }

    try {
        const {name, userID, role} = verifyToken(token)
        req.user = {name, userID, role}
        next()
    } catch (error) {
        throw new UnauthenticatedError('Invalid credentials')
    }
}

const authorizePermission = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Unauthorized to acces this route')
        }
        next()
    }
}

module.exports = {
    authenticateUser,
    authorizePermission
}