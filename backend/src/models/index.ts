//import { Sequelize } from "sequelize";
import sequelize from "../config/db.ts";
import User from "./User.model.ts";
import Group from "./Group.model.ts";
import GroupMembers from "./GroupMembers.model.ts";
import Expense from "./Expense.model.ts";
import ExpenseSplit from "./ExpenseSplit.model.ts";

///export { Sequelize };

export interface Models {
    User: ReturnType<typeof User>;
    Group: ReturnType<typeof Group>;
    GroupMembers: ReturnType<typeof GroupMembers>;
    Expense: ReturnType<typeof Expense>;
    ExpenseSplit: ReturnType<typeof ExpenseSplit>;
}

const models: Models = {
    User: User(sequelize),
    Group: Group(sequelize),
    GroupMembers: GroupMembers(sequelize),
    Expense: Expense(sequelize),
    ExpenseSplit: ExpenseSplit(sequelize),
};

models.GroupMembers.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
models.User.hasMany(models.GroupMembers, { foreignKey: "user_id", as: "groupMembers" });

models.GroupMembers.belongsTo(models.Group, { foreignKey: "group_id", as: "group" });
models.Group.hasMany(models.GroupMembers, { foreignKey: "group_id", as: "groupMembers" });

models.Expense.belongsTo(models.User, { foreignKey: "paid_by_user_id", as: "paidByUser" });
models.User.hasMany(models.Expense, { foreignKey: "paid_by_user_id", as: "expenses" });

models.Expense.belongsTo(models.Group, { foreignKey: "group_id", as: "groupExpense" });
models.Group.hasMany(models.Expense, { foreignKey: "group_id", as: "expenses" });

// ExpenseSplit associations
models.Expense.hasMany(models.ExpenseSplit, { foreignKey: "expense_id", as: "splits", onDelete: "CASCADE" });
models.ExpenseSplit.belongsTo(models.Expense, { foreignKey: "expense_id", as: "expense" });

models.ExpenseSplit.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
models.User.hasMany(models.ExpenseSplit, { foreignKey: "user_id", as: "expenseSplits" });


export default models;