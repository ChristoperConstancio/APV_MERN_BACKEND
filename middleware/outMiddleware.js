import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";
const checkAuth = async (req, res, next) => {

    let token;
    //verifica que tenga el token de autorizacion
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //sacamos el token en dos arrays el primero con bearer y el segundo con el token 
            token = req.headers.authorization.split(' ')[1];
            const decoded  = jwt.verify(token, process.env.JWT_SECRET)
            // buscar por el id de decoded
             req.veterinario =  await Veterinario.findById(decoded.id).select(
                "-password -token -confirmado"
            )
            return next();
        } catch (e) {
            const error = new Error('token no valido ');
            return res.status(403).json({ msg: error.message })
        }
    }
    if(!token){
        const error = new Error('token no valido o inexistentes');
        res.status(403).json({ msg: error.message })
    }
        
    next();
}

export default checkAuth;