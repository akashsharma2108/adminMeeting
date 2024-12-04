import { Investor } from './investor';
import { PortfolioCompany } from './portfolioCompany';

export interface Selection {
  SelId: number;
  InvId: number;
  PFId: number;
  createdAt?: Date;
  updatedAt?: Date;
  Investor?: Investor;
  PortfolioCompany?: PortfolioCompany;
}

export interface SelectionCreationAttributes {
  InvId: number;
  PFId: number;
}
