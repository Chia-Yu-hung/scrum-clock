import * as Sequelize from "sequelize";
import { Status } from "../config";
interface UserOfActivityAttributes {
  userId?: string;
  activityId?: string;
  status?: Status;
  updated_time?: Date;
}

export type UserOfActivityInstance = Sequelize.Instance<
  UserOfActivityAttributes
> &
  UserOfActivityAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserOfActivityAttributes> = {
    status: {
      type: Sequelize.ENUM(Status.Normal, Status.Deleted),
      defaultValue: Status.Normal
    },
    updated_time: {
      type: Sequelize.DATE,
      defaultValue: new Date()
    }
  };
  return sequalize.define<UserOfActivityInstance, UserOfActivityAttributes>(
    "user_of_activity",
    attributes
  );
};
