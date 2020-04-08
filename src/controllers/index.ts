import MessageRouter, { fromUser, fromGroup } from "koa-line-message-router";
import line from "@line/bot-sdk";
import { registerUserToGroup } from "../middleware";
import {
  updateUserByMessageEvent,
  updateUserOfGroupWhenJoin
} from "../modules/userHepler";

import { Timer } from "../util/timer";
import { LotteryDrawer } from "../util/lotteryDrawer";
import moment from "moment";
import { findAllMembersOfGroup } from "../modules/groupHelper";
import { pickDrawMethodMessage } from "../modules/messageTemplate";

const router = new MessageRouter();
let daily_clock: Timer = null;
let lotteryDrawer: LotteryDrawer = null;

// test();
// async function test() {
//   let members = await findAllMembersOfGroup(
//     "C67cdf49eab032c4ea07b42f5dce2c3d2"
//   );

//   let scrum_drawer: LotteryDrawer = new LotteryDrawer(members.users, 1);
//   console.log(JSON.stringify(members.users, null, 2));
//   const changes = scrum_drawer.getDrawChangeOfMember();

//   console.log(changes);
//   const men = await scrum_drawer.normalDraw();
//   console.log(men);
//   const men2 = await scrum_drawer.memoryDraw();
//   console.log(men2);
// }

router.message(async (ctx, next) => {
  await updateUserByMessageEvent(ctx.client, ctx.event);
  await next();
});

router.message(
  /^開啟提醒$/g,
  fromGroup(),
  registerUserToGroup(),
  async (ctx, next) => {
    if (daily_clock === null) {
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
    } else {
      ctx.$replyMessage({
        type: "text",
        text: "已開啟Daily提醒!!"
      });
    }
  }
);

router.message(
  /^關閉提醒$/g,
  fromGroup(),
  registerUserToGroup(),
  async (ctx, next) => {
    if (daily_clock === null)
      return ctx.$replyMessage({ type: "text", text: "尚未開啟提醒哦!!!" });
    daily_clock.stop();
    daily_clock = null;
    return ctx.$replyMessage({ type: "text", text: "已關閉提醒" });
  }
);

router.message(
  /^抽$/g,
  // fromGroup(),
  // registerUserToGroup(),
  async (ctx, next) => {
    return ctx.$replyMessage(pickDrawMethodMessage());
  }
);

router.postback(
  // fromGroup(), registerUserToGroup(),
  async (ctx, next) => {
    const event = ctx.event as line.PostbackEvent;
    console.log(event);
  }
);

router.message(
  /^%$/g,
  // fromGroup(),
  // registerUserToGroup(),
  async (ctx, next) => {
    if (lotteryDrawer === null) {
      const { groupId } = ctx.event.source as line.Group;
      const members_of_group = await findAllMembersOfGroup(groupId);
      lotteryDrawer = new LotteryDrawer(members_of_group.users, 1);
      const changes_table = lotteryDrawer.getDrawChangeOfMember();
      return ctx.$replyMessage({
        type: "text",
        text: JSON.stringify(changes_table)
      });
    }
  }
);

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
