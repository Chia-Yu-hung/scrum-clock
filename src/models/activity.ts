import * as Sequelize from "sequelize";
import { Status } from "../config";
import { UserInstance } from "./user";
export interface ActivityAttributes {
  id?: string;
  description: string;
  status?: Status;
  created_time?: Date;
  start_time?: Date;
  end_time?: Date;
  groupId?: string;
  users?: UserInstance[];
}

export type ActivityInstance = Sequelize.Instance<ActivityAttributes> &
  ActivityAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<ActivityAttributes> = {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    description: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.ENUM(Status.Normal, Status.Deleted, Status.Completed),
      defaultValue: Status.Normal
    },
    created_time: {
      type: Sequelize.DATE,
      defaultValue: new Date()
    },
    start_time: {
      type: Sequelize.DATE,
      allowNull: true
    },
    end_time: {
      type: Sequelize.DATE,
      allowNull: true
    }
  };
  return sequalize.define<ActivityInstance, ActivityAttributes>(
    "activity",
    attributes
  );
};
