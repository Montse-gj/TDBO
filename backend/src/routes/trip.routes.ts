import { Router } from "express";
import { GroupController } from "../controllers/trip.controller.ts";

const router = Router();

router.post("/", GroupController.createGroup);
router.get("/:groupId/members", GroupController.getGroupMembers);
router.put("/:groupId", GroupController.updateGroup);
router.delete("/:groupId/delete", GroupController.deleteGroup);

export default router;

/*
http://localhost:3000/api/trips/1/members

curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": 2,
    "group_name": "default",
    "created_by": "Marcos",
    "trip_starts": "2026-06-01",
    "trip_ends": "2026-06-01"
  }'

curl -X DELETE http://localhost:3000/api/trips/2

update:
curl -X PUT http://localhost:3000/api/trips/1 \
  -H "Content-Type: application/json" \
  -d '{
    "group_name": "Nuevo nombre",
    "created_by": "Luis",
    "trip_starts": "2026-06-02",
    "trip_ends": "2026-06-10"
  }'
*/