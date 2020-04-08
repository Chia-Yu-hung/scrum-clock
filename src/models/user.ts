import * as Sequelize from "sequelize";
import { UserType } from "../config";

export interface UserAttributes {
  id?: string;
  display_name?: string;
  picture_url?: string;
  type?: UserType;
  count?: any;
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserAttributes> = {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      unique: true,
      defaultValue: Sequelize.UUIDV4
    },
    type: {
      type: Sequelize.ENUM(UserType.Unknown, UserType.Line),
      defaultValue: UserType.Unknown
    },
    display_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    picture_url: {
      type: Sequelize.STRING,
      allowNull: true
    },
    count: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  };
  return sequalize.define<UserInstance, UserAttributes>("user", attributes);
};
