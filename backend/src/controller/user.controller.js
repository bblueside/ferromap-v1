import { User } from "../model/user.model.js";
import jwt from 'jsonwebtoken'
import { InexpectedError } from "../validations/errors/inexpected.error.js";

const register = async (req, res) => {
try {
    // req.body ya viene validado y normalizado por validate(registerSchema)
    const { username, email, password } = req.body;

    // check if user exists already

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "user already exists!" });
    }

    // create user

    const user = await User.create({
        username,
        email,
        password,
    });

    res.status(201).json({
        message: "User registered!",
        user: { id: user._id, email: user.email, username: user.username }
    });

} catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
}
};

const login = async (req, res) => {
    try {
        
        // req.body ya viene validado y normalizado por validate(loginSchema)
        const { email, password } = req.body;

        
        const user = await User.findOne({ email });

        if(!user) return res.status(400).json({
             message: "Usuario o contraseña incorrectos"
        });

        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(400).json({
             message: "Usuario o contraseña incorrectos"
        });

        const token = jwt.sign({id:user._id, user: user.username}, process.env.SECRET_JWT_KEY, {
            expiresIn:'1h'
        } )

        res.cookie('access_token',token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'strict',
            maxAge: 1000*60*60
        })
        res.status(200).json({
            message: "User Logged in",
            user: {
                id: user._id,
                email: user.email,
                username: user.username 
            }
        })
    } catch (InexpectedError) {
        const error = InexpectedError
        res.status(400).json({
            message: error.message
        })
    }
}

const logout = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            email
        });

        if(!user) return res.status(404).json({
            message: "User not found"
        });

        res.clearCookie('access_token')
         
        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        });
    }
}

const me = async (req, res) => {
    try {
        // El payload del JWT trae `id` y `user` (username), pero NO el email.
        // Releemos de Mongo para devolver EXACTAMENTE el mismo shape que /login
        // ({ id, email, username }) y que el shape de usuario viva en un solo sitio.
        const user = await User.findById(req.session.user.id).select("email username");

        if (!user) {
            // Token válido pero el usuario ya no existe (borrado). Limpiamos la
            // cookie para que el cliente deje de reintentar.
            res.clearCookie("access_token");
            return res.status(401).json({ message: "No autenticado" });
        }

        return res.status(200).json({
            user: { id: user._id, email: user.email, username: user.username }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error", error: error.message
        });
    }
}

const inicio = async (req, res) => {
    try{

        const {user} = req.session
        if(!user){
            return res.render('index')
        }

        res.render('index', user)

    }catch(error){
        res.render('index')
    }


}

const protegido = async (req, res) => {
    const {user} = req.session
    if(!user){
        return res.status(401).send('No access')
    }
    try{
        res.render('protegido', user)
    }catch(error){
        res.status(403).send('No access')
    }

}

export {
    register,
    login,
    logout,
    me,
    inicio,
    protegido
};