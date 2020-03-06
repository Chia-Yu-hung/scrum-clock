import * as Sequelize from "sequelize"

interface GroupAttributes {
  id?: string;
}

export type GroupInstance = Sequelize.Instance<GroupAttributes> & GroupAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<GroupAttributes> = {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    }
  };
  return sequelize.define<GroupInstance, GroupAttributes>("group", attributes);
};