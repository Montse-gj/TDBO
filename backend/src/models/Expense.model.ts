import { DataTypes, Model, Sequelize } from "sequelize";

class Expense extends Model {
    declare expense_id: number;
    declare group_id: number;
    declare paid_by_user_id: number;
    declare amount: number;
    declare created_at: Date;
    declare description: string;
}

export default (sequelize: Sequelize) => {
    Expense.init(
        {
            expense_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            paid_by_user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            description: {
                type: DataTypes.STRING(89),
                allowNull: false
            },
        },
        {
            sequelize,
            tableName: "expenses",
            timestamps: false
        }
    );

    return Expense;
};