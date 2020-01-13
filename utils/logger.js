import { createLogger, format, transports } from "winston";

export default createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.splat(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ level: "warn", filename: "logs/combined.log" })
  ]
});
