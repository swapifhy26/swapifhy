import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    getNotifications,
    markAsRead,
    markAllAsRead
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticateToken);

router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
