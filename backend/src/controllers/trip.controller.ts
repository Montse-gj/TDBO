import type { Response } from "express";
import db from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.ts";

export const GroupController = {
  // Crear un nuevo grupo de viaje
  createGroup: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { group_name, trip_starts, trip_ends } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado." });
      }

      // Validamos campos obligatorios (sin group_id)
      if (!group_name) {
        return res.status(400).json({ error: "El nombre del grupo es obligatorio." });
      }

      // Buscamos el nombre del creador en la base de datos
      const creatorUser = await db.User.findByPk(userId);
      const creatorName = creatorUser ? creatorUser.user_name : "Usuario";

      // Creamos el grupo de viaje
      const newGroup = await db.Group.create({
        group_name,
        created_by: creatorName,
        trip_starts: trip_starts || new Date(),
        trip_ends: trip_ends
      });

      // Añadimos automáticamente al creador como el primer miembro del grupo
      await db.GroupMembers.create({
        group_id: newGroup.group_id,
        user_id: userId
      });

      return res.status(201).json({
        message: "Grupo creado con éxito e integrado como miembro",
        group: newGroup
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al crear el grupo" });
    }
  },

  // Obtener todos los grupos a los que pertenece el usuario actualmente autenticado
  getUserGroups: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado." });
      }

      // Buscamos las membresías del usuario
      const memberships = await db.GroupMembers.findAll({
        where: { user_id: userId },
        include: [
          {
            model: db.Group,
            as: "group"
          }
        ]
      });

      // Extraemos los objetos de grupo
      const groups = memberships
        .map((m: any) => m.group)
        .filter(Boolean);

      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al obtener tus grupos" });
    }
  },

  // Obtener los miembros de un grupo con sus datos básicos (sin contraseña)
  getGroupMembers: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;

      const group = await db.Group.findOne({
        where: { group_id: Number(groupId) },
        include: [
          {
            model: db.GroupMembers,
            as: "groupMembers",
            include: [
              {
                model: db.User,
                as: "user",
                attributes: {
                  exclude: ["user_password", "when_created", "is_admin"]
                }
              }
            ]
          }
        ]
      });

      if (!group) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      return res.status(200).json(group);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al obtener los miembros" });
    }
  },

  // Añadir un usuario al grupo de viaje
  addMember: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;
      const { email, userId } = req.body;

      // Validamos que el grupo exista
      const groupExists = await db.Group.findByPk(Number(groupId));
      if (!groupExists) {
        return res.status(404).json({ error: "El grupo especificado no existe." });
      }

      // Buscar al usuario por email o por ID
      let targetUser = null;
      if (email) {
        targetUser = await db.User.findOne({ where: { user_email: email } });
      } else if (userId) {
        targetUser = await db.User.findByPk(Number(userId));
      }

      if (!targetUser) {
        return res.status(404).json({ error: "El usuario a invitar no fue encontrado." });
      }

      // Verificar si ya es miembro
      const alreadyMember = await db.GroupMembers.findOne({
        where: { group_id: Number(groupId), user_id: targetUser.user_id }
      });

      if (alreadyMember) {
        return res.status(400).json({ error: "Este usuario ya pertenece al grupo." });
      }

      // Añadir miembro
      const newMember = await db.GroupMembers.create({
        group_id: Number(groupId),
        user_id: targetUser.user_id
      });

      return res.status(201).json({
        message: "Usuario añadido al grupo con éxito",
        member: {
          group_id: newMember.group_id,
          user_id: newMember.user_id,
          user_name: targetUser.user_name,
          user_email: targetUser.user_email
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al añadir al miembro" });
    }
  },

  // Eliminar un miembro del grupo
  removeMember: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { groupId, userId } = req.params;

      const deleted = await db.GroupMembers.destroy({
        where: {
          group_id: Number(groupId),
          user_id: Number(userId)
        }
      });

      if (!deleted) {
        return res.status(404).json({ error: "La relación de miembro no existe." });
      }

      return res.status(200).json({ message: "Miembro eliminado del grupo con éxito" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al eliminar al miembro" });
    }
  },

  // Eliminar un grupo
  deleteGroup: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;

      // Primero eliminamos los miembros asociados del grupo para evitar errores de integridad
      await db.GroupMembers.destroy({ where: { group_id: Number(groupId) } });
      
      // Opcional: también podríamos eliminar los gastos de ese grupo o dejarlos huérfanos. 
      // Por simplicidad eliminamos los gastos del grupo asociados
      await db.Expense.destroy({ where: { group_id: Number(groupId) } });

      const deleted = await db.Group.destroy({
        where: { group_id: Number(groupId) }
      });

      if (!deleted) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      return res.status(200).json({ message: "Grupo eliminado con éxito" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al borrar el grupo" });
    }
  },

  // Actualizar la información del grupo
  updateGroup: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;
      const { group_name, created_by, trip_starts, trip_ends } = req.body;

      const group = await db.Group.findOne({
        where: { group_id: Number(groupId) }
      });

      if (!group) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      await group.update({
        group_name: group_name ?? group.group_name,
        created_by: created_by ?? group.created_by,
        trip_starts: trip_starts ?? group.trip_starts,
        trip_ends: trip_ends ?? group.trip_ends
      });

      return res.status(200).json({
        message: "Grupo actualizado con éxito",
        group
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al actualizar el grupo" });
    }
  },
};