import type { Response } from "express";
import { Op } from "sequelize";
import db from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";

export const UserController = {
  // Obtener el perfil del usuario actualmente autenticado (usando el token JWT)
  getProfile: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado. Token faltante o inválido." });
      }

      const user = await db.User.findByPk(userId, {
        attributes: { exclude: ["user_password"] }
      });

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al obtener el perfil del usuario." });
    }
  },

  // Buscar usuarios por nombre o correo (ideal para invitaciones o añadir a grupos)
  searchUsers: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Se requiere un parámetro de búsqueda 'query' válido." });
      }

      const users = await db.User.findAll({
        where: {
          [Op.or]: [
            { user_name: { [Op.iLike]: `%${query}%` } },
            { user_email: { [Op.iLike]: `%${query}%` } }
          ],
          // Opcional: no devolverse a sí mismo en los resultados de búsqueda
          user_id: { [Op.ne]: req.user?.id || 0 }
        },
        attributes: { exclude: ["user_password"] },
        limit: 10
      });

      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al realizar la búsqueda de usuarios." });
    }
  },

  // Listar todos los usuarios del sistema (excepto contraseñas)
  listUsers: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const users = await db.User.findAll({
        attributes: { exclude: ["user_password"] }
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al listar los usuarios." });
    }
  }
};
