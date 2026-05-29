import { DataTypes, Model, Sequelize } from "sequelize";

class GroupMembers extends Model {
    declare group_id: number;
    declare user_id: number;
}

export default (sequelize: Sequelize) => {
    GroupMembers.init(
        {
            group_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            sequelize,
            tableName: "group_members",
            timestamps: false
        }
    );

    return GroupMembers;
};