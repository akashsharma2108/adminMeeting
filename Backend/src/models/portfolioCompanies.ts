import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connections/postgres";
import { PortfolioCompany } from "../types/portfolioCompany";

export interface PortfolioCompanyInstance extends Model<PortfolioCompany>, PortfolioCompany {}

export const portfolioCompaniesSchema = sequelize.define<PortfolioCompanyInstance, PortfolioCompany>(
  "PortfolioCompanies",
  {
    PFId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    PFName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    PFCompany: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    PFTimezone: {
      type: DataTypes.STRING(50),
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
    tableName: "PortfolioCompanies",
    timestamps: true,
  }
);

