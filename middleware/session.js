const { verifyToken } = require("../utils/handleJwt");
const { usersModel } = require("../models");
const { errorHandler } = require("../utils/responseHandler");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return errorHandler(new Error('NOT_TOKEN'), res);
        }

        const token = authHeader.split(" ").pop();
        const dataToken = await verifyToken(token);
        if (!dataToken || !dataToken._id) {
            return errorHandler(new Error('INVALID_TOKEN'), res);
        }

        const user = await usersModel.findById(dataToken._id);
        if (!user) {
            return errorHandler(new Error('USER_NOT_EXISTS'), res);
        }

        if (req.url !== '/validate' && !user.validated) {
            return errorHandler(new Error('EMAIL_NOT_VALIDATED'), res);
        }

        // Verificar si la cuenta está bloqueada
        if (user.isLocked && user.isLocked()) {
            return errorHandler(new Error('ACCOUNT_LOCKED'), res);
        }

        req.user = user;
        next();
    } catch (err) {
        return errorHandler(new Error('INVALID_TOKEN'), res);
    }
};

module.exports = authMiddleware;