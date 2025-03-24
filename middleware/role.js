const { errorHandler } = require("../utils/responseHandler");

const checkRole = (roles) => (req, res, next) => {
    try {
        const { user } = req;
        if (!user || !user.role) {
            return errorHandler(new Error('UNAUTHORIZED_ACTION'), res);
        }

        if (!roles.includes(user.role)) {
            return errorHandler(new Error('NOT_ALLOWED'), res);
        }

        next();
    } catch (err) {
        return errorHandler(new Error('UNAUTHORIZED_ACTION'), res);
    }
};

module.exports = checkRole;
