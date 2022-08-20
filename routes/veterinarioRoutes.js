import express from "express";
import { autenticar, comprobarPassword, confirmar, nuevoPassword, olvidePassword, perfil, registrar, actualizarPerfil, acutalizarPassword } from "../controllers/veterinarioController.js";
import checkAuth from "../middleware/outMiddleware.js";

const router = express.Router();

// area publica
//tipo post porque envias datos al servidor
router.post('/',registrar )
///: Parametro dinamico como se defina se debe escribir en el controller
router.get('/confirmar/:token', confirmar )
router.post('/login',   autenticar)
//comprobar el email
router.post('/olvide-password', olvidePassword)
//                  leer el token         ||           crear el nuevo password 

router.route('/olvide-password/:token').get(comprobarPassword).post(nuevoPassword);
//Checkauth nos ayuda a saber si el usuario tiene permiso de entrar a las vistas, mientras tenga su jwt activo
// Area privada
router.get('/perfil', checkAuth, perfil)
router.put('/perfil/:id', checkAuth, actualizarPerfil)
router.put('/actualizar-password', checkAuth, acutalizarPassword)

export default router;