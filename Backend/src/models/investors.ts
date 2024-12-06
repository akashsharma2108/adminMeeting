import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connections/postgres";
import { Investor } from "../types/investor";

export interface InvestorInstance extends Model<Investor>, Investor {}

export const investorsSchema = sequelize.define<InvestorInstance, Investor>(
  "Investors",
  {
    InvId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    InvName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    InvCompany: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    InvTimezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    InvEmail: {
      type: DataTypes.STRING(100),
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
    tableName: "Investors",
    timestamps: true,
  }
);

