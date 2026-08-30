import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
    getSwapRequests,
    acceptSwap,
    getMentorships,
    updateMentorshipProgress,
    leaveSwap,
    scheduleClass,
    addResource,
    gradeAssignment,
    rateTeacher
} from "../controllers/mentorship.controller";

const router = Router();

router.use(authenticate);

// SWAP REQUESTS
router.get("/requests", getSwapRequests);
router.post("/:id/accept", acceptSwap);

// MENTORSHIP HUB
router.get("/", getMentorships);
router.post("/:id/leave", leaveSwap);

// TEACHER ACTIONS
router.post("/:id/classes", scheduleClass);
router.post("/:id/resources", addResource);
router.post("/:id/assignments", gradeAssignment); // Using the same for create & grade

// STUDENT ACTIONS
router.put("/:id/progress", updateMentorshipProgress);
router.post("/:id/rate", rateTeacher);

export default router;
