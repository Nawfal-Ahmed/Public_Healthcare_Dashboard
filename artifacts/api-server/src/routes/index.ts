import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import alertsRouter from "./alerts";
import vaccinationsRouter from "./vaccinations";
import usersRouter from "./users";
import metricsRouter from "./metrics";
import reportsRouter from "./reports";
import blogsRouter from "./blogs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(alertsRouter);
router.use(vaccinationsRouter);
router.use(usersRouter);
router.use(metricsRouter);
router.use(reportsRouter);
router.use(blogsRouter);

export default router;
