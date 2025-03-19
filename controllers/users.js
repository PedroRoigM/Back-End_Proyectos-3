/**
* Obtener lista de la base de datos
* @param {*} req
* @param {*} res
*/
// Funcioens importantes para los usuarios de la web: getUsers, getUser, createUser
// Así permite crear, leer y obtener usuarios de la base de datos
const { matchedData } = require("express-validator")
const { encrypt, compare } = require("../utils/handlePassword")
const { usersModel } = require("../models")
const { tokenSign } = require("../utils/handleJwt")
const { handleHttpError } = require("../utils/handleError")
// Petición GET para obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const user = req.user
        const data = await usersModel.find({})
        res.send({ data, user })
    } catch (err) {
        handleHttpError(res, "ERROR_GET_USERS", 403)
    }
}
// Petición GET para obtener un usuario en específico según su ID
const getUser = async (req, res) => {
    try {
        const { user } = matchedData(req)
        const data = await usersModel.findById(user)
        if (!data) {
            return handleHttpError(res, "USER_NOT_EXISTS", 404)
        }
        res.send(data)
    } catch (err) {
        handleHttpError(res, "ERROR_GET_USER")
    }
}

const registerCtrl = async (req, res) => {
    req = matchedData(req)
    const password = await encrypt(req.password)
    const body = {...req, password}
    const dataUser = await usersModel.create(body)
    dataUser.set('password', undefined, { strict: false })
    const data = {
        token: await tokenSign(dataUser),
        user: dataUser
    }
    res.send(data)
}

const loginCtrl = async (req, res) => {
    try {
        req = matchedData(req)
        const user = await usersModel.findOne({ email: req.email }).select("password name email validated role")
        if (!user || !user.validated) {
            handleHttpError(res, "NOT_ABLE_TO_LOGIN", 404)
            return
        }
        const hashPassword = user.password
        const check = await compare(req.password, hashPassword)
        if (!check) {
            await usersModel.findByIdAndUpdate(user._id, { $inc: { athempts: 1 } })
            if (user.athempts >= 3) {
                handleHttpError(res, "MAX_ATHEMPTS", 401)
                return
            }
            handleHttpError(res, "INVALID_PASSWORD", 401)
            return
        }
        user.set("password", undefined, { strict: false })
        const data = {
            token: await tokenSign({ ...user.toObject(), validated: user.validated, role: user.role }),
            user
        }
        res.send(data)
    } catch (err) {
        console.log(err)
        handleHttpError(res, "ERROR_LOGIN_USER")
    }
}

const updateUser = async (req, res) => {
    try {
        const { id, ...body } = matchedData(req)
        const data = await usersModel.findByIdAndUpdate(id, body, { new: true })
        if (!data) {
            return handleHttpError(res, "USER_NOT_EXISTS", 404)
        }
        res.send(data)
    } catch (err) {
        handleHttpError(res, "ERROR_UPDATE_USER")
    }
}

const deleteUser = async (req, res) => {
    try {
        const { user } = matchedData(req)
        const data = await usersModel.delete({ _id: user })
        if (!data) {
            return handleHttpError(res, "USER_NOT_EXISTS", 404)
        }
        res.send({ message: 'User deleted succesfully' })
    } catch (err) {
        handleHttpError(res, "ERROR_DELETE_USER")
    }
}
// TODO: validateUser, updateRole, getUsersByEmailOrNameAndRole (buscar subcadena en email o nombre (si no recibe nada no poner filtros, va a entrar un unico campo "search" por lo que no diferenciar en la busqueda), tener en cuenta que puede recibir un rol o no)
// /api/users/search?role=role
/*
    {
        search: "subcadena"
    }
*/
// const validateUser = async (req, res) => {
//     try {
//         const { user } = req
//         const { code } = req.body

//         if (code !== user.code) {
//             user.athempts += 1
//             if (user.athempts >= 3) {
//                 await usersModel.findByIdAndUpdate(user._id, { $set: { code: null } })
//                 return handleHttpError(res, "MAX_ATHEMPTS", 401)
//             }
//             await usersModel.findByIdAndUpdate(user._id, { athempts: user.athempts }, { new: true })
//             handleHttpError(res, "INVALID_CODE", 401)
//             return
//         }
//         await usersModel.findByIdAndUpdate(user._id, { validated: true, athempts: 0 }, { new: true })

//         // Devolver ok
//         res.send({ message: "User validated" })
//     } catch (err) {
//         console.log(err)
//         handleHttpError(res, "ERROR_VALIDATE_USER")
//     }
// }
// Solicitar codigo para recuperar contraseña, recibe el correo
const requestRecoverPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await usersModel
            .findOne({ email })
            .select("email code")
        if (!user) {
            return handleHttpError(res, "USER_NOT_EXISTS", 404)
        }
        // Generar código y guardarlo en la base de datos
        const code = Math.floor(100000 + Math.random() * 900000)

        await usersModel.findOneAndUpdate({ email }, { code: code, athempts: 0 }, { new: true })
        // Enviar email con el código
        // Aquí se enviaría el correo con el código

        // Devolver ok
        res.send({ message: "Code sent to email" })
    }
    catch (err) {
        handleHttpError(res, "ERROR_REQUEST_RECOVER_PASSWORD")
    }
}
// Recuperar contraseña, recibe el correo, la nueva contraseña y el código
const recoverPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body
        const user = await usersModel.findOne({ email }).select("_id code password athempts")
        if (!user || user.code !== code) {
            user.athempts += 1
            if (user.athempts >= 3) {
                await usersModel.findByIdAndUpdate(user._id, { $set: { code: null } })
                return handleHttpError(res, "MAX_ATHEMPTS", 401)
            }
            await usersModel.findByIdAndUpdate(user._id, { $set: { athempts: user.athempts } })
            return handleHttpError(res, "INVALID_CODE", 401)
        }
        // Comprobar que la nueva contraseña no sea igual a la anterior
        const actualPassword = user.password

        const check = await compare(password, actualPassword)
        if (check) {
            handleHttpError(res, "SAME_PASSWORD", 401)
            return
        }

        const hashPassword = await encrypt(password)
        await usersModel
            .findOneAndUpdate({ email }, { password: hashPassword, athempts: 0 }, { new: true })
        // Devolver ok
        res.send({ message: "Password recovered" })
    }
    catch (err) {
        handleHttpError(res, "ERROR_RECOVER_PASSWORD")
    }
}
module.exports = {
    getUsers,
    getUser,
    registerCtrl,
    loginCtrl,
    updateUser,
    deleteUser,
    //validateUser,
    recoverPassword,
    requestRecoverPassword
}
