import { DataTypes, Model, Sequelize } from "sequelize";

class Group extends Model {
    declare group_id: number;
    declare group_name: string;
    declare created_by: string;
    declare trip_starts: Date;
    declare trip_ends: Date;
}

export default (sequelize: Sequelize) => {
    Group.init(
        {
            group_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                defaultValue: 'Nuevo grupo'
            },
            group_name: {
                type: DataTypes.STRING(89),
                allowNull: false
            },
            created_by: {
                type: DataTypes.STRING(89),
                allowNull: false
            },
            trip_starts: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            trip_ends: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue() {
                    const now = new Date();
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
                }
            },
        },
        {
            sequelize,
            tableName: "groups",
            timestamps: false
        }
    );

    return Group;
};