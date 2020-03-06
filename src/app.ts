import dotenv from "dotenv";
dotenv.config();
import * as database from "./database";

import messageRouter from "./controllers";

import Koa from "koa";

import bodyParser from "koa-bodyparser";

import { channelAccessToken, channelSecret, path } from "./config";

import { RouterConfig } from "koa-line-message-router/dist/lib/types";

const config: RouterConfig = {
  channelAccessToken,
  channelSecret,
  path
};

const app = new Koa();

app.use(bodyParser());
app.use(messageRouter.lineSignature(config));
app.use(messageRouter.routes(config));

async function start() {
  try {
    await database.init();
    app.context.$db = database;
    app.listen(process.env.PORT || 3000);
  } catch (error) {
    console.log(error);
    process.exit();
  }
}

start();
