// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../controllers/auth.controller.js'; 

// Clave secreta para desencriptar y verificar los tokens JWT (debe coincidir con la de auth.controller)
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

// Extendemos la interfaz Request localmente para decirle a TypeScript que vamos a 
// inyectar un nuevo objeto 'user' dentro de las peticiones (req) que pasen por este middleware.
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Este middleware actúa como un "vigilante de seguridad" en las rutas privadas.
export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
  // 1. Buscamos el token JWT en las cabeceras (headers) de la petición HTTP bajo 'authorization'
  const authHeader = req.headers['authorization'];
  
  // 2. Extraemos el token separándolo del texto "Bearer" (Formato típico: "Bearer el_token_aqui")
  const token = authHeader && authHeader.split(' ')[1];

  // 3. Si no hay token, rechazamos la petición devolviendo un error 401 (No Autorizado)
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    // 4. Intentamos verificar la firma matemática del token usando nuestra clave secreta.
    // Si el token fue modificado o ha expirado, jwt.verify() lanzará un error automáticamente.
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // 5. Si es válido, inyectamos los datos del usuario (id y email) dentro de 'req.user'.
    // Así, los controladores que vengan después podrán saber qué usuario hizo la petición.
    req.user = decoded; 
    
    // 6. Damos paso a la función controladora de la ruta (continuamos el flujo)
    next();
  } catch (error) {
    // 7. Si falló la verificación (token falso o expirado), denegamos el acceso (403 Prohibido)
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};