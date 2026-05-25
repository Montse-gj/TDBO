// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../controllers/auth.controller.ts";
import db from "../models/index.ts";

// Clave secreta para desencriptar y verificar los tokens JWT (debe coincidir con la de auth.controller)
const JWT_SECRET = process.env.JWT_SECRET || "tdbo_default_jwt_secret";

// Extendemos la interfaz Request localmente para decirle a TypeScript que vamos a
// inyectar un nuevo objeto 'user' dentro de las peticiones (req) que pasen por este middleware.
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Este middleware actúa como un "vigilante de seguridad" en las rutas privadas.
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  // 1. Buscamos el token JWT en las cabeceras (headers) de la petición HTTP bajo 'authorization'
  const authHeader = req.headers["authorization"];

  // 2. Extraemos el token separándolo del texto "Bearer" (Formato típico: "Bearer el_token_aqui")
  const token = authHeader && authHeader.split(" ")[1];

  // 3. Si no hay token, rechazamos la petición devolviendo un error 401 (No Autorizado)
  if (!token) {
    return res
      .status(401)
      .json({ error: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    // 4. Intentamos verificar la firma matemática del token usando nuestra clave secreta.
    // Si el token fue modificado o ha expirado, jwt.verify() lanzará un error automáticamente.
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // 5. Verificar de manera robusta que el usuario decodificado realmente existe en la base de datos.
    // Esto previene fallas si la base de datos se reinició/limpió pero el navegador mantiene un token viejo.
    const userExists = await db.User.findByPk(decoded.id);
    if (!userExists) {
      return res
        .status(401)
        .json({
          error:
            "El usuario de la sesión ya no existe. Por favor, inicia sesión de nuevo.",
        });
    }

    // 6. Si es válido y existe, inyectamos los datos del usuario (id y email) dentro de 'req.user'.
    req.user = decoded;

    // 7. Damos paso a la función controladora de la ruta (continuamos el flujo)
    next();
  } catch (error) {
    // 8. Si falló la verificación (token falso o expirado), denegamos el acceso (403 Prohibido)
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// Middleware para verificar que el usuario autenticado pertenece al grupo
export const verifyGroupMembership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const userId = req.user?.id;
  const groupId = req.params.groupId || req.body.group_id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "No autorizado. Inicia sesión de nuevo." });
  }

  if (!groupId) {
    return res.status(400).json({ error: "Falta el identificador del grupo." });
  }

  const parsedGroupId = Number(groupId);
  if (isNaN(parsedGroupId)) {
    return res
      .status(400)
      .json({ error: "El identificador del grupo no es válido." });
  }

  try {
    const membership = await db.GroupMembers.findOne({
      where: {
        group_id: parsedGroupId,
        user_id: userId,
      },
    });

    if (!membership) {
      return res
        .status(403)
        .json({
          error: "Acceso denegado. No eres miembro de este grupo de viaje.",
        });
    }

    next();
  } catch (error) {
    console.error("Error al verificar la membresía del grupo:", error);
    return res
      .status(500)
      .json({ error: "Error del servidor al verificar acceso al grupo" });
  }
};
