import Server from "./app";
import { connection } from "./configs/mysql";

const server = new Server();

connection
  .then(() => console.log("Connected to mysql"))
  .catch(e => console.log(e));

server.init();
server.start();
