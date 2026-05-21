import type { Request, Response } from "express";
import db from "../models/index.ts";

export const GroupController = {
  createGroup: async (req: Request, res: Response): Promise<any> => {
    console.log("got here")
    try {
      const { group_id, group_name, created_by, trip_starts, trip_ends } = req.body;

      if (!group_id || !group_name || !created_by) {
        return res.status(400).json({ error: "group_id, group_name y created_by son obligatorios" });
      }

      const groupExists = await db.Group.findOne({ where: { group_id } });
      if (groupExists) {
        return res.status(400).json({ error: "El grupo ya existe" });
      }

      const newGroup = await db.Group.create({
        group_id,
        group_name,
        created_by,
        trip_starts,
        trip_ends
      });

      return res.status(201).json({
        message: "Grupo creado con éxito",
        group: newGroup
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error del servidor al crear el grupo" });
    }
  },

  getGroupMembers: async (req: Request, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;

      const group = await db.Group.findOne({
        where: { group_id: groupId },
        include: [
          {
            model: db.GroupMembers,
            as: "groupMembers",
            include: [
              {
                model: db.User,
                as: "user"
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

  deleteGroup: async (req: Request, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;

      const deleted = await db.Group.destroy({
        where: { group_id: groupId }
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

  updateGroup: async (req: Request, res: Response): Promise<any> => {
    try {
      const { groupId } = req.params;
      const { group_name, created_by, trip_starts, trip_ends } = req.body;

      const group = await db.Group.findOne({
        where: { group_id: groupId }
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