
// src/controllers/authController.ts
import { Request, Response } from 'express';
import db from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 1. Añade esta interfaz para que TypeScript conozca el tipado del payload
export interface JWTPayload {
  id: number;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'yourJWTsecretMAYnotKEEPyouSAFE';



export const AuthController = {
  register: async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      const userExists = await db.User.findOne({ where: { user_email: email } });
      if (userExists) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await db.User.create({
        user_name: name,
        user_email: email,
        user_password: hashedPassword
      });

      return res.status(201).json({
        message: 'Usuario registrado con éxito',
        user: newUser
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error del servidor en el registro' });
    }
  },

  login: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }

      const user = await db.User.findOne({ where: { user_email: email } });
      if (!user || !user.user_password) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.user_password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      const payload: JWTPayload = { id: user.user_id, email: user.user_email };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

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