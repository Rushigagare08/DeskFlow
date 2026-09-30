import { Router } from "express";
import { getWorkspaces } from "../controllers/workspaceController";

const router = Router();

router.get("/", getWorkspaces);

export default router;
