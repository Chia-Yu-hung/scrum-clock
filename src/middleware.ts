import Context from "koa-line-message-router/dist/lib/context";
import { Group } from "@line/bot-sdk";
import database from "./database";
import { Role } from "./config";

import { Message } from "@line/bot-sdk/lib/types";
import * as _ from "lodash";
import { LastActivityContext, UsersContext } from "./type";
import { ActivityInstance } from "./models/activity";
import { getLastActByGroup } from "./modules/activityHelper";
import { findOneUnknowUserByDisplayName, registerUnknowUser } from "./modules/userHepler"




export function registerUserToGroup() {
  return async function (ctx: Context, next: () => Promise<null>) {
    const { groupId, userId } = ctx.event.source as Group;
    await database.UserGroup.upsert({
      groupId,
      userId,
      role: Role.User
    });
    await next();
  }
}

export function isLastActFinished(callback?: (lastActivity: ActivityInstance) => Message) {
  return async function isLastActFinished(ctx: LastActivityContext, next: () => Promise<void>) {
    const { groupId } = ctx.event.source as Group;
    if (!groupId) {
      console.log("no group id");
      return;
    }

    const lastActivity = await getLastActByGroup(groupId);
    ctx.lastActivity = lastActivity;

    if (callback) {
      let msg = callback(lastActivity);
      if (msg) {
        console.log(msg);
        return ctx.$replyMessage(msg);
      }

      return await next();
    }
    await next();
  }
}

function parserMultipleUsers(ctx: UsersContext & LastActivityContext) {
  const temp: { [key: string]: number } = {};
  return ctx.text
    .substring(0, ctx.text.length - 2)
    .split(/\s/)
    .filter(str => !_.isEmpty(str))
    .map(user => user.trim())
    .map(user => {
      if (user.startsWith("@")) {
        return user.substring(1);
      }
      return user;
    }).filter(user => {
      //
      // remove duplicates
      //
      if (temp[user]) {
        return false;
      }
      temp[user] = 1;
      return true;
    });
}

export function handelMultipleUser() {
  return async function handelMultipleUser(ctx: UsersContext & LastActivityContext, next: () => Promise<void>) {
    let users = parserMultipleUsers(ctx);
    console.log(users);
    const userIns = await Promise.all(
      users.map(async user => {
        const userIns = await findOneUnknowUserByDisplayName(user, ctx.lastActivity);
        if (userIns) {
          return userIns;
        }

        return await registerUnknowUser(user)
      })
    );
    ctx.users = userIns;
    await next();
  }
}

export function isRemoveUsersInGroup() {
  return async function isRemoveUsersInGroup(ctx: UsersContext & LastActivityContext, next: () => Promise<void>) {
    let users = parserMultipleUsers(ctx);
    const userIns = await Promise.all(
      users.map(async user => {
        const userIns = await findOneUnknowUserByDisplayName(user, ctx.lastActivity);
        if (userIns) {
          return userIns;
        }
        // notify unknow user name
      })
    );
    ctx.users = userIns;
    await next();
  }
}