import MessageRouter, { fromUser, fromGroup } from "koa-line-message-router";
import line from "@line/bot-sdk";
import { MemberMessage } from "../modules/messageTemplate";
import { registerUserToGroup } from "../middleware";
import {
  updateUserByMessageEvent,
  updateUserOfGroupWhenJoin,
  findOneUser
} from "../modules/userHepler";
import {
  getLastActByGroup,
  addUserToActivity
} from "../modules/activityHelper";

import { Timer } from "../util/timer";
import moment from "moment";

const router = new MessageRouter();

router.message(async (ctx, next) => {
  await updateUserByMessageEvent(ctx.client, ctx.event);
  await next();
});
let daily_clock: Timer = null;

router.message(
  /^開啟提醒$/g,
  fromGroup(),
  registerUserToGroup(),
  async (ctx, next) => {
    daily_clock = new Timer(
      moment().set({ hour: 17, minute: 30, second: 0 }),
      async () => {
        try {
          let source: line.Group = ctx.event.source as any;
          await ctx.client.pushMessage(source.groupId, {
            type: "text",
            text: "Daily time, everybody move on!!"
          });
        } catch (error) {
          console.log(error);
        }
      }
    );
    await daily_clock.run();
    ctx.$replyMessage({
      type: "text",
      text: "開啟Daily提醒!!"
    });
  }
);

router.message(/^關閉提醒$/g, async (ctx, next) => {
  if (daily_clock === null)
    return ctx.$replyMessage({ type: "text", text: "尚未開啟提醒哦!!!" });
  daily_clock.stop();
  daily_clock = null;
  return ctx.$replyMessage({ type: "text", text: "已關閉提醒" });
});

router.message(/^抽$/g, async (ctx, next) => {
  return ctx.$replyMessage({
    type: "text",
    text: "Kyle Lai為下次reviewer & 值日生"
  });
});

router.message(/help/gi, ctx =>
  ctx.$replyMessage({ type: "text", text: "help" } as line.Message)
);

router.memberJoined(fromGroup(), async (ctx, next) => {
  await updateUserOfGroupWhenJoin(
    ctx.client,
    ctx.event as line.MemberJoinEvent
  );
});

router.use(async ctx => {
  // logger.info("not found function handle this event");
  console.log("not found function handle this event");
});

export default router;
