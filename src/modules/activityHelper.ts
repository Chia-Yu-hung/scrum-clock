
import database from "../database";
import activity, { ActivityInstance, ActivityAttributes } from "../models/activity";
import { UserInstance } from "../models/user";
import { Status } from "../config"
import { Group } from "@line/bot-sdk"
import { LastActivityContext } from "../type"
import sequelize = require("sequelize");
import isArray from "lodash/isArray";
export async function getLastActByGroup(groupId: string): Promise<ActivityInstance> {
  const activity = await database.Activity.findOne({
    where: {
      groupId,
      status: Status.Normal
    },

    order: [["created_time", "DESC"]]
  });
  return activity;
}
export async function activityStart(ctx: LastActivityContext) {
  console.log("activity start");
  const { groupId } = ctx.event.source as Group;
  const activity = await database.Activity.create({
    description: ctx.text,
    start_time: new Date(),
    groupId: groupId
  });
}

export async function activityEnd(activity: ActivityInstance) {
  await database.Activity.update({
    status: Status.Completed,
    end_time: new Date()
  },
    {
      where: {
        id: activity.id
    }
  })
}

export async function findAllMembersOfGame(activity: ActivityInstance): Promise<ActivityInstance> {
  return database.Activity.findOne({
    where: {
      id: activity.id
    },

    order: [[database.User, database.UserActivity, "updated_time", "ASC"]],
    include: [
      {
        model: database.User,
        as: "users",
        through: {
          attributes: [],
          where: {
            status: {
              [sequelize.Op.ne]: Status.Deleted
            }
          }
        }
      }
    ]
  });
}

export async function addUserToActivity(users: UserInstance | UserInstance[], activity: ActivityInstance): Promise<ActivityInstance> {
  let userSet = [];
  if (isArray(users)) {
    userSet = users;
  } else {
    userSet = [users];
  }

  await Promise.all(
    userSet.map(user => {
      return database.UserActivity.upsert({
        userId: user.id,
        activityId: activity.id,
        status: Status.Normal,
        updated_time: new Date()
      });
    })
  );
  return await findAllMembersOfGame(activity);
}

export async function removeUserFromActivity(users: UserInstance | UserInstance[], activity: ActivityInstance): Promise<ActivityInstance> {
  let userSet = [];
  if (isArray(users)) {
    userSet = users;
  } else {
    userSet = [users];
  }

  await Promise.all(
    userSet.map(user => {
      return database.UserActivity.update(
        { status: Status.Deleted, updated_time: new Date() },
        { where: { userId: user.id, activityId: activity.id } }
      )
    })
  );
  return await findAllMembersOfGame(activity);
}