import { DataTypes, Model, Sequelize } from "sequelize";

class User extends Model {
    declare user_id: number;
    declare user_name: string;
    declare user_email: string;
    declare user_password: string;
    declare when_created: Date;
    declare is_admin: boolean;
}

export default (sequelize: Sequelize) => {
    User.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            user_name: {
                type: DataTypes.STRING(89),
                allowNull: false
            },
            user_email: {
                type: DataTypes.STRING(144),
                allowNull: false,
                unique: true
            },
            user_password: {
                type: DataTypes.STRING(144),
                allowNull: false
            },
            when_created: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            is_admin: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            sequelize,
            tableName: "users",
            timestamps: false
        }
    );

    return User;
};