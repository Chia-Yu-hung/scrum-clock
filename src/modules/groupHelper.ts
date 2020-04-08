import database from "../database";
import { GroupInstance } from "../models/group";

export async function findAllMembersOfGroup(group: any): Promise<any> {
  return database.Group.findOne({
    where: {
      id: group
    },

    order: [[database.User, database.UserGroup, "role", "ASC"]],
    include: [
      {
        model: database.User,
        as: "users"
      }
    ]
  });
}
