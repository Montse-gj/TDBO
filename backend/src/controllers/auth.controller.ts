
// src/controllers/authController.ts
import { Request, Response } from 'express';
import db from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Interfaz que define la estructura de los datos que vamos a guardar dentro del Token JWT
export interface JWTPayload {
  id: number;
  email: string;
}

// Clave secreta para firmar los tokens JWT. Debe guardarse en el archivo .env en producción.
const JWT_SECRET = process.env.JWT_SECRET || 'yourJWTsecretMAYnotKEEPyouSAFE';

export const AuthController = {
  // Controlador para el REGISTRO de nuevos usuarios
  register: async (req: Request, res: Response): Promise<any> => {
    try {
      // 1. Extraemos los datos enviados por el usuario en el cuerpo de la petición (body)
      const { name, email, password } = req.body;

      // 2. Validación básica: Comprobamos que no falte ningún campo
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      // 3. Verificamos si ya existe un usuario registrado con ese mismo email en la base de datos
      const userExists = await db.User.findOne({ where: { user_email: email } });
      if (userExists) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // 4. Encriptación de la contraseña: No podemos guardar contraseñas en texto plano por seguridad.
      // 'salt' añade una capa extra de aleatoriedad antes de hacer el hash.
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 5. Guardamos el nuevo usuario en la base de datos con la contraseña ya encriptada
      const newUser = await db.User.create({
        user_name: name,
        user_email: email,
        user_password: hashedPassword
      });

      // 6. Devolvemos un código de éxito (201 Created) y los datos del usuario creado
      return res.status(201).json({
        message: 'Usuario registrado con éxito',
        user: newUser
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error del servidor en el registro' });
    }
  },

  // Controlador para el INICIO DE SESIÓN de usuarios
  login: async (req: Request, res: Response): Promise<any> => {
    try {
      // 1. Extraemos el email y contraseña enviados desde el frontend
      const { email, password } = req.body;

      // 2. Comprobamos que el usuario nos ha enviado ambos campos
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }

      // 3. Buscamos al usuario en la base de datos a través de su email
      const user = await db.User.findOne({ where: { user_email: email } });
      
      // Si el usuario no existe, o por algún motivo no tiene contraseña, denegamos el acceso
      if (!user || !user.user_password) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      // 4. Comparamos la contraseña enviada en el login con la contraseña encriptada de la base de datos
      const isMatch = await bcrypt.compare(password, user.user_password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      // 5. Si todo es correcto, preparamos el contenido (Payload) del token JWT.
      // Aquí metemos el ID y el email para poder identificarlos luego en peticiones protegidas.
      const payload: JWTPayload = { id: user.user_id, email: user.user_email };

      // 6. Generamos el Token JWT firmado con nuestra clave secreta. 
      // 'expiresIn' indica cuándo dejará de ser válido el token (en este caso, dura 24 horas).
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      // 7. Devolvemos el token al frontend para que lo guarde (normalmente en localStorage o cookies) 
      // y lo envíe en las futuras peticiones para demostrar que está autenticado.
      return res.status(200).json({
        message: 'Login correcto',
        token,
        user: { id: user.user_id, name: user.user_name, email: user.user_email }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error del servidor en el login' });
    }
  }
};