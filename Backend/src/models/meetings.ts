import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connections/postgres";
import { Meeting } from "../types/meeting";
import { selectionsSchema } from "./selections";

interface MeetingInstance extends Model<Meeting>, Meeting {}

export const meetingsSchema = sequelize.define<MeetingInstance, Meeting>(
  "Meetings",
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
    tableName: "Meetings",
    timestamps: true,
  }
);

meetingsSchema.belongsTo(selectionsSchema, { foreignKey: "SelId" });

