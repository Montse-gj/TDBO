// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../controllers/auth.controller.js'; 

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

// Extendemos la interfaz Request localmente para este archivo o para toda la app
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Maneja el formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded; // Ahora TS sabe perfectamente que req.user tiene id y email
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};