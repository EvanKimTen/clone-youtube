import express from "express";

import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo } from "../controllers/videoController";
import { protectorMiddleware } from "../middlewares";

const videoRouter = express.Router();

// upload is recognized as id variable instead of upload itself.
videoRouter.get("/:id([0-9a-f]{24})", watch); // reason for the bottom than upload
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteVideo);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(postUpload);

// videoRouter.get("/:id[0-9a-f]{24}(\\d+)/delete", deleteVideo);
export default videoRouter;
