import { Router } from "express";
import { login, getCurrentUser, register } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", authenticate, getCurrentUser);

export default router;
