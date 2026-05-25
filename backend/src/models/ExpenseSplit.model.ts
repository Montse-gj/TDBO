import { DataTypes, Model, Sequelize } from "sequelize";

class ExpenseSplit extends Model {
    declare split_id: number;
    declare expense_id: number;
    declare user_id: number;
    declare amount: number;
}

export default (sequelize: Sequelize) => {
    ExpenseSplit.init(
        {
            split_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            expense_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "expenses",
                    key: "expense_id"
                },
                onDelete: "CASCADE"
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id"
                }
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            }
        },
        {
            sequelize,
            tableName: "expense_splits",
            timestamps: false
        }
    );

    return ExpenseSplit;
};
