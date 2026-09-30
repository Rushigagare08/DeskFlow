import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  getRequestActivities,
  createWorkItemFromRequest,
} from "../controllers/requestController";

const router = Router();

router.get("/", authenticate, getRequests);
router.get("/:id", authenticate, getRequestById);
router.post("/", authenticate, createRequest);
router.put("/:id", authenticate, updateRequest);
router.get("/:id/activities", authenticate, getRequestActivities);
router.post("/:id/work-item", authenticate, createWorkItemFromRequest);

export default router;
