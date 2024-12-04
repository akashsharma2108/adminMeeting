import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connections/postgres";
import { Selection, SelectionCreationAttributes } from "../types/selection";
import { investorsSchema } from "./investors";
import { portfolioCompaniesSchema } from "./portfolioCompanies";
import { InvestorInstance } from "./investors"
import { PortfolioCompanyInstance } from "./portfolioCompanies";

interface SelectionInstance extends Model<Selection, SelectionCreationAttributes>, Selection {
  Investor?: InvestorInstance;
  PortfolioCompany?: PortfolioCompanyInstance;
}

export const selectionsSchema = sequelize.define<SelectionInstance>(
  "Selections",
  {
    SelId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    InvId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    PFId: {
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
    tableName: "Selections",
    timestamps: true,
  }
);

selectionsSchema.belongsTo(investorsSchema, { foreignKey: "InvId", as: "Investor" });
selectionsSchema.belongsTo(portfolioCompaniesSchema, { foreignKey: "PFId", as: "PortfolioCompany" });

export { SelectionInstance };
