const {UnauthorizedError} = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === 'admin') return;
    if (requestUser.userID === resourceUserId.toString()) return;
    throw new UnauthorizedError('Not authorized to acces this route')
}

module.exports = checkPermissions