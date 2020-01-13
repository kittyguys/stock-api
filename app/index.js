import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fileupload from "express-fileupload";
import { initRouter } from "../routes";

export default class Server {
  constructor() {
    this.server = express();
  }

  init() {
    this.server.set("host", process.env.HOST);
    this.server.set("port", process.env.PORT);

    this.server.use(bodyParser.json());
    this.server.use(
      bodyParser.urlencoded({
        extended: false
      })
    );
    this.server.use(cors());
    this.server.use(fileupload());

    // TODO: mongo
    // mongoose
    //   .connect("mongodb://localhost:27017/hachet", {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //     useFindAndModify: false
    //   })
    //   .then(() => console.log("mongoose connected successfully"))
    //   .catch(err => console.error(err));

    // Initialize routes
    initRouter(this.server);
  }

  start() {
    const host = this.server.get("host");
    const port = this.server.get("port");

    this.server.listen(port, function() {
      console.log("Express server listening on - http://" + host + ":" + port);
    });
  }
}
