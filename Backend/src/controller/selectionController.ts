import { Request, Response } from 'express';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { selectionsSchema } from '../models/selections';
import { investorsSchema } from '../models/investors';
import { portfolioCompaniesSchema } from '../models/portfolioCompanies';
import { meetingsSchema } from '../models/meetings';
import { nonmeetingsSchema } from '../models/nonmeeting';
import { availabilitySlotsSchema } from '../models/availabilitySlot';


export const getAllSelections = async (_req: Request, res: Response) => {
  try {
    const selections = await selectionsSchema.findAll({
      include: [
        { model: investorsSchema, as: 'Investor' },
        { model: portfolioCompaniesSchema, as: 'PortfolioCompany' },
      ],
    });
    sendResponse(res, 200, { message: 'Selections fetched', selections});
  } catch (error) {
    handleError(res, error);
  }
};
export const generateSelections = async (_req: Request, res: Response) => {
  try {
    // Clear existing data in Selections
    await selectionsSchema.sequelize.query('TRUNCATE "Selections" CASCADE');
    await selectionsSchema.sequelize.query('ALTER SEQUENCE "Selections_SelId_seq" RESTART WITH 1');

    const investors = await investorsSchema.findAll();
    const portfolioCompanies = await portfolioCompaniesSchema.findAll();
    const availabilitySlots = await availabilitySlotsSchema.findAll();

    if (investors.length === 0 || portfolioCompanies.length === 0 || availabilitySlots.length === 0) {
      return sendResponse(res, 400, { message: 'Missing data for Investors, Portfolio Companies, or Availability Slots' });
    }

    // Create a set of unique timezones from availability slots
    const availableTimezones = new Set(availabilitySlots.map((slot) => slot.timezone));

    // Filter investors based on available timezones
    const eligibleInvestors = investors.filter((investor) =>
      availableTimezones.has(investor.InvTimezone)
    );
    
    const nonEligibleInvestors = investors.filter((investor) =>
      !availableTimezones.has(investor.InvTimezone)
    );
    const nonEligibleInvestorsIds = nonEligibleInvestors.map((investor) => 
      portfolioCompanies.map((portfolioCompany) => ({
        InvId: investor.InvId,
        PFId: portfolioCompany.PFId,
      }))
    );

    if (eligibleInvestors.length === 0) {
      return sendResponse(res, 400, { message: 'No investors matched available timezones' });
    }
   
    // Generate valid pairs
    const validPairs = eligibleInvestors.flatMap((investor) =>
      portfolioCompanies.map((portfolioCompany) => ({
        InvId: investor.InvId,
        PFId: portfolioCompany.PFId,
      }))
    );

    // Insert pairs into Selections table
    const newSelections = await selectionsSchema.bulkCreate(validPairs);
    return sendResponse(res, 201, { message: 'Selections created', data: newSelections , ineligible: nonEligibleInvestorsIds});

  } catch (error) {
    handleError(res, error);
  }
};



export const getSelectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const selection = await selectionsSchema.findByPk(id, {
      include: [
        { model: investorsSchema, as: 'Investor' },
        { model: portfolioCompaniesSchema, as: 'PortfolioCompany' }
      ]
    });
    if (selection) {
      sendResponse(res, 200, selection);
    } else {
      sendResponse(res, 404, { message: 'Selection not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const createSelection = async (req: Request, res: Response) => {
  try {
    await meetingsSchema.destroy({
            truncate: true
          });
    await nonmeetingsSchema.destroy({
            truncate: true
    });
    const { InvId, PFId } = req.body;
    const investor = await investorsSchema.findByPk(InvId);
    const portfolioCompany = await portfolioCompaniesSchema.findByPk(PFId);

    if (!investor || !portfolioCompany) {
      return sendResponse(res, 400, { message: 'Invalid Investor or Portfolio Company ID' });
    }

    // Check if the selection already exists
    const existingSelection = await selectionsSchema.findOne({ where: { InvId, PFId } });
    if (existingSelection) {
      return sendResponse(res, 400, { message: 'This selection already exists' });
    }

    const newSelection = await selectionsSchema.create({ InvId, PFId });
    sendResponse(res, 201, newSelection);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateSelection = async (req: Request, res: Response) => {
  try {
    await meetingsSchema.destroy({
      truncate: true
    });
await nonmeetingsSchema.destroy({
      truncate: true
});
    const { id } = req.params;
    const { InvId, PFId } = req.body;

    // Validate that the Investor and Portfolio Company exist
    const investor = await investorsSchema.findByPk(InvId);
    const portfolioCompany = await portfolioCompaniesSchema.findByPk(PFId);

    if (!investor || !portfolioCompany) {
      return sendResponse(res, 400, { message: 'Invalid Investor or Portfolio Company ID' });
    }

    const [updatedRowsCount, updatedSelections] = await selectionsSchema.update(
      { InvId, PFId },
      {
        where: { SelId: id },
        returning: true,
      }
    );

    if (updatedRowsCount > 0) {
      sendResponse(res, 200, updatedSelections[0]);
    } else {
      sendResponse(res, 404, { message: 'Selection not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteSelection = async (req: Request, res: Response) => {
  try {
    await meetingsSchema.destroy({
      truncate: true
    });
    await nonmeetingsSchema.destroy({
      truncate: true
    }); 
    const { id } = req.params;
    const deletedRowsCount = await selectionsSchema.destroy({
      where: { SelId: id },
    });
    if (deletedRowsCount > 0) {
      sendResponse(res, 200, { message: 'Selection deleted successfully' });
    } else {
      sendResponse(res, 404, { message: 'Selection not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

