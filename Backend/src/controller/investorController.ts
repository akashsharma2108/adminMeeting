import { Request, Response } from 'express';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { investorsSchema } from '../models/investors';

export const getAllInvestors = async (_req: Request, res: Response) => {
  try {
    const investors = await investorsSchema.findAll();
    sendResponse(res, 200, investors);
  } catch (error) {
    handleError(res, error);
  }
};

export const getInvestorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const investor = await investorsSchema.findByPk(id);
    if (investor) {
      sendResponse(res, 200, investor);
    } else {
      sendResponse(res, 404, { message: 'Investor not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const createInvestor = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      let newInvestors;
  
      if (Array.isArray(data.InvName) || Array.isArray(data.InvCompany) || Array.isArray(data.InvTimezone)) {
        const investorsData = data.InvName.map((name: string, index: number) => ({
          InvName: name,
          InvCompany: data.InvCompany[index],
          InvTimezone: data.InvTimezone[index]
        }));
        newInvestors = await investorsSchema.bulkCreate(investorsData);
      } else {
        newInvestors = await investorsSchema.create(data);
      }
  
      sendResponse(res, 201, newInvestors);
    } catch (error) {
      handleError(res, error);
    }
  };

export const updateInvestor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount, updatedInvestors] = await investorsSchema.update(req.body, {
      where: { InvId: id },
      returning: true,
    });
    if (updatedRowsCount > 0) {
      sendResponse(res, 200, updatedInvestors[0]);
    } else {
      sendResponse(res, 404, { message: 'Investor not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteInvestor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await investorsSchema.destroy({
      where: { InvId: id },
    });
    if (deletedRowsCount > 0) {
      sendResponse(res, 200, { message: 'Investor deleted successfully' });
    } else {
      sendResponse(res, 404, { message: 'Investor not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

