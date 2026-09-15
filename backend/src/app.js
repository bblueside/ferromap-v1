import express from "express";
import userRouter from './routes/user.route.js'; 
import mapRouter from './routes/map.route.js'; 
import dashboard from './routes/dashboard.route.js'; 
import control from './routes/control.route.js'; 
import cookieParser from "cookie-parser";
import { jwt_middleware } from "./middleware/jwt.middleware.js";

const app = express();  // create an express app
app.set('view engine','ejs');

app.use(express.json());
app.use(cookieParser());
app.use(jwt_middleware);

// routes declaration
app.use("/api/users", userRouter);
app.use("/api/map", mapRouter);
app.use("/api/dashboard", dashboard);
app.use("/api/control", control);
export default app;