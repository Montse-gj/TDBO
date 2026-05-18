//import { Sequelize } from "sequelize";
import sequelize from "../config/db.ts";
import User from "./User.model.ts";
import Group from "./Group.model.ts";
import GroupMembers from "./GroupMembers.model.ts";
import Expense from "./Expense.model.ts";

///export { Sequelize };

export interface Models {
    User: ReturnType<typeof User>;
    Group: ReturnType<typeof Group>;
    GroupMembers: ReturnType<typeof GroupMembers>;
    Expense: ReturnType<typeof Expense>;
}

const models: Models = {
    User: User(sequelize),
    Group: Group(sequelize),
    GroupMembers: GroupMembers(sequelize),
    Expense: Expense(sequelize)
};

models.GroupMembers.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
models.User.hasMany(models.GroupMembers, { foreignKey: "user_id", as: "groupMembers" });

models.GroupMembers.belongsTo(models.Group, { foreignKey: "group_id", as: "group" });
models.Group.hasMany(models.GroupMembers, { foreignKey: "group_id", as: "groupMembers" });

models.Expense.belongsTo(models.User, { foreignKey: "paid_by_user_id", as: "paidByUser" });
models.User.hasMany(models.Expense, { foreignKey: "paid_by_user_id", as: "expenses" });

models.Expense.belongsTo(models.Group, { foreignKey: "group_id", as: "groupExpense" });
models.Group.hasMany(models.Expense, { foreignKey: "group_id", as: "expenses" });

export default models;