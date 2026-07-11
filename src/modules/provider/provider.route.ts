import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { providerController } from "./provider.controller";

const router = Router();

router.post("/gear", auth(Role.PROVIDER), providerController.addGearItem);

router.get("/gear", auth(Role.PROVIDER), providerController.getMyGearItems);



export const providerRoutes = router;
