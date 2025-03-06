const { handleHttpError } = require("../utils/handleError")
const checkRole = (roles) => (req, res, next) => {
    try {
        const { user } = req
        const userRole = user.role
        const checkValueRole = roles.includes(userRole)
        if (!checkValueRole) {
            handleHttpError(res, "NOT_ALLOWED", 403)
            return
        }
        next()
    } catch (err) {
        handleHttpError(res, "ERROR_PERMISSIONS", 403)
    }
}

module.exports = checkRole 