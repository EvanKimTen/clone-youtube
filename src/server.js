import express from "express";
import { handle } from "express/lib/application";
import res from "express/lib/response";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

const app = express(); 
const logger = morgan("common");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/viewers");

app.use(logger);
app.use(express.urlencoded({ extended: true }));
// first used in 6.4

app.use(
    session({
      secret: "Hello",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
      // (connect-mongo)
      // this enables the server to remember sessions
      // always stored in the database once you input session.
    })
  );
  
app.use((req, res, next) => {
req.sessionStore.all((error, sessions) => {
    // console.log(sessions);
    next();
});
});
// app.get("/add-one", (req, res, next) => {
//     req.session.potato += 1;
//     return res.send(`${req.session.id} ${req.session.potato}`);
// });  

app.use(localsMiddleware); // order after session is imp
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;