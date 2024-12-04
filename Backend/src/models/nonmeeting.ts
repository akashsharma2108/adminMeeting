import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connections/postgres";
import { NonMeeting } from "../types/nonmetting";
import { selectionsSchema } from "./selections";

interface NonMeetingInstance extends Model<NonMeeting>, NonMeeting {}

export const nonmeetingsSchema = sequelize.define<NonMeetingInstance, NonMeeting>(
  "nonMeetings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "nonMeetings",
    timestamps: true,
  }
);

nonmeetingsSchema.belongsTo(selectionsSchema, { foreignKey: "SelId" });

