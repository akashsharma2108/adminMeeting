import { Request, Response } from 'express';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { nonmeetingsSchema } from '../models/nonmeeting';
import { selectionsSchema } from '../models/selections';


export const getAllnonMeetings = async (_req: Request, res: Response) => {
  try {
    const meetings = await nonmeetingsSchema.findAll({
      include: [{
              model: selectionsSchema,
              include: ['Investor', 'PortfolioCompany']
            }]
    });
    sendResponse(res, 200, meetings);
  } catch (error) {
    handleError(res, error);
  }
};

