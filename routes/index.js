import authRoutes from "./auth";
import userRoutes from "./users";
import stockRoutes from "./stocks";
import noteRoutes from "./notes";
import { verifyToken } from "../middlewares/auth";
import { errorHandler, logErrors } from "../middlewares/error";

export const initRouter = server => {
  // without auth
  server.use("/api", authRoutes);
  // routing
  server.use("*", verifyToken);
  server.use("/api", userRoutes);
  server.use("/api", stockRoutes);
  server.use("/api", noteRoutes);
  // error handling
  server.use(logErrors);
  server.use(errorHandler);
};
