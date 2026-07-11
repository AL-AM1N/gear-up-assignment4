import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { authRoutes } from "./modules/auth/auth.routes";
import { gearRoutes } from "./modules/gear/gear.route";
import { categoryRoutes } from "./modules/category/category.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { providerRoutes } from "./modules/provider/provider.route";

const app: Application = express();

app.use(cors({
    origin: config.app_url || true,
    credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send("GearUp - Rent Sports & Outdoor Gear Instantly");
});

app.use("/api/auth", authRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/provider", providerRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
