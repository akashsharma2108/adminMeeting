import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connections/postgres";
import { AvailabilitySlot } from "../types/availabilitySlot";

interface AvailabilitySlotInstance extends Model<AvailabilitySlot>, AvailabilitySlot {}

export const availabilitySlotsSchema = sequelize.define<AvailabilitySlotInstance, AvailabilitySlot>(
  "AvailabilitySlots",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    tableName: "AvailabilitySlots",
    timestamps: false,
  }
);

