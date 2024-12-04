import { Request, Response } from 'express';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { portfolioCompaniesSchema } from '../models/portfolioCompanies';

export const getAllPortfolioCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await portfolioCompaniesSchema.findAll();
    sendResponse(res, 200, companies);
  } catch (error) {
    handleError(res, error);
  }
};

export const getPortfolioCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await portfolioCompaniesSchema.findByPk(id);
    if (company) {
      sendResponse(res, 200, company);
    } else {
      sendResponse(res, 404, { message: 'Portfolio Company not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const createPortfolioCompany = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      let newCompanies;
  
      if (Array.isArray(data.PFName) || Array.isArray(data.PFCompany) || Array.isArray(data.PFTimezone)) {
        // Bulk creation
        const companiesData = data.PFName.map((name: string, index: number) => ({
          PFName: name,
          PFCompany: data.PFCompany[index],
          PFTimezone: data.PFTimezone[index]
        }));
        newCompanies = await portfolioCompaniesSchema.bulkCreate(companiesData);
      } else {
        // Single company creation
        newCompanies = await portfolioCompaniesSchema.create(data);
      }
  
      sendResponse(res, 201, newCompanies);
    } catch (error) {
      handleError(res, error);
    }
  };

export const updatePortfolioCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount, updatedCompanies] = await portfolioCompaniesSchema.update(req.body, {
      where: { PFId: id },
      returning: true,
    });
    if (updatedRowsCount > 0) {
      sendResponse(res, 200, updatedCompanies[0]);
    } else {
      sendResponse(res, 404, { message: 'Portfolio Company not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const deletePortfolioCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await portfolioCompaniesSchema.destroy({
      where: { PFId: id },
    });
    if (deletedRowsCount > 0) {
      sendResponse(res, 200, { message: 'Portfolio Company deleted successfully' });
    } else {
      sendResponse(res, 404, { message: 'Portfolio Company not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

