import Veterinario from "../models/Veterinario.js"
import generarJWT from "../helpers/generarJWT.js"
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

// Req.params lee los parametros de la url y req.body de un formulario
const registrar = async (req, res) => {

    const { email, nombre } = req.body;

    // prevenir usuarios duplicados || con findone ayuda  a buscar en los registros
    const existeUsuario = await Veterinario.findOne({ email });

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        // En caso de que se inserte necesitamos que de verdad se inserte para avisar al usuario que se inserto
        const veterinarioGuardado = await veterinario.save();

        //Enviar el email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token,
        });

        res.json(veterinarioGuardado);

    } catch (error) {
        console.error(error);
    }

};

const perfil = (req, res) => {
    const { veterinario } = req;
    res.json({ perfil: veterinario })
}

const confirmar = async (req, res) => {
    const { token } = req.params

    const usuarioConfirmar = await Veterinario.findOne({ token });

    if (!usuarioConfirmar) {
        const error = new Error('Token no valido');
        return res.status(404).json({ msg: error.message });
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({ msg: 'Usuario confirmado' })

    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req, res) => {
    const { email, password } = req.body

    // comprobar si existe el usuario
    const usuario = await Veterinario.findOne({ email });

    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message });
    }

    // comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmado');
        return res.status(403).json({ msg: error.message });
    }

    // Revisar el usuario
    if (await usuario.comprobarPassword(password)) {
        console.log(usuario);
        // autenticar
        usuario.token = generarJWT(usuario.id);
        res.json( {
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token : generarJWT(usuario._id),
            
        });
    } else {
        const error = new Error('Password incorrecto');
        return res.status(403).json({ msg: error.message });
    }
}

const olvidePassword = async (req, res) => {
    //creamos un token para modificar el passs
    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({ email });
    if (!existeVeterinario) {
        const error = new Error("Usuario no existe");
        return res.status(403).json({ msg: error.message });
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        //Enviar email con instrucciones
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token

        })
        res.json({ msg: "Hemos enviado un email con las instrucciones" })
    } catch (error) {
        console.log(error);
    }
}

const comprobarPassword = async (req, res) => {
    const { token } = req.params;


    const tokenValido = await Veterinario.findOne({ token });

    res.json({ msg: "usuario valido" })

    if (tokenValido) {
        //El token es valido el usuario existe

    } else {
        const error = new Error("Token no valido");
        return res.status(403).json({ msg: error.message })
    }
}
const nuevoPassword = async (req, res) => {

    const { token } = req.params;
    if (token.length < 20 || token.length > 22) {
        const error = new Error("Token no valido");
        return res.status(400).json({ msg: error.message });
    }
    const { password } = req.body
    const veterinario = await Veterinario.findOne({ token })
    if (!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }
   

    try {
        veterinario.token = null
        veterinario.password = password
        await veterinario.save();
        res.json({ msg: "password modificado correcto" });
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async (req,res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if(!veterinario){
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }
    const { email } = req.body;

    if(veterinario.email !== req.body.email){
        const existeEmail = await Veterinario.findOne({email});

        if(existeEmail){
            const error = new Error('Ese email ya esta en uso');
            return res.status(400).json({ msg: error.message });
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error);
    }
}

const acutalizarPassword = async (req,res)  => {
    // Leer los datos
    const {id} = req.veterinario;
    const { pwd_actual, pwd_nuevo} = req.body;
    // comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id);
    if(!veterinario){
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }
    // comprobar password
    if(await veterinario.comprobarPassword(pwd_actual)){
        veterinario.password = pwd_nuevo;
        await veterinario.save();
         res.json({ msg: 'Password Almacenado Correctamente' });
    }else{
        const error = new Error('El Password actual es incorrecto');
        return res.status(400).json({msg: error.message});
    }
    // alamcenar el nuevo password


}
export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarPassword,
    nuevoPassword,
    actualizarPerfil,
    acutalizarPassword
}