import * as line from "@line/bot-sdk";
import database from "../database";
import { UserType, LINE_VERIFY_USER_ID, Status} from "../config";
import { ActivityInstance } from "../models/activity";

/**
 * get user from group
 * @param client
 * @param source
 */

export async function updateUserByMessageEvent(client: line.Client, event: line.WebhookEvent): Promise<void> {
  let line_user: line.Profile;
  let source: line.Group | line.User = event.source as any;

  if (source.type === "user") {
    console.log(source.userId);
    if (source.userId === LINE_VERIFY_USER_ID) return;

    line_user = await client.getProfile(source.userId);
    await database.User.upsert({
      id: line_user.userId,
      display_name: line_user.displayName,
      picture_url: line_user.pictureUrl,
      type: UserType.Line
    });
  } else if (source.type === "group") {
    line_user = await client.getGroupMemberProfile(
      source.groupId,
      source.userId
    )

    await Promise.all([
      await database.User.upsert({
        id: line_user.userId,
        display_name: line_user.displayName,
        picture_url: line_user.pictureUrl,
        type: UserType.Line
      }),
      await database.Group.upsert({
        id: source.groupId
      })
    ]);
    await database.UserGroup.upsert({
      userId: line_user.userId,
      groupId: source.groupId
    });
  }
}

export async function updateUserOfGroupWhenJoin(client: line.Client, event: line.MemberJoinEvent): Promise<void> {
  if (event.source.type !== "group") {
    return;
  }

  const members: line.User[] = event.joined.members.filter(member => member.type === "user");

  const groupId = event.source.groupId;
  const userProfile: line.Profile[] = await Promise.all(
    members.map(member => client.getGroupMemberProfile(groupId, member.userId))
  );

  await Promise.all(
    userProfile.map(profile => {
      database.User.upsert({
        id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl,
        type: UserType.Line
      })
    })
  );
}

export async function findOneUser(id: any) {
  return database.User.findOne({
    where: {
      id
    }
  })
}

export async function findOneUnknowUserByDisplayName(name: string, activity: ActivityInstance) {
  const user = await database.User.findOne({
    where: { display_name: name, type: UserType.Unknown },
    include: [
      {
        model: database.Activity,
        through: {
          where: {
            activityId: activity.id,
            status: Status.Normal
          }
        },
        required: true
      }
    ]
  });
  return user;
}

export async function registerUnknowUser(user: string) {
  return database.User.create({
    display_name: user,
    type: UserType.Unknown
  });
}