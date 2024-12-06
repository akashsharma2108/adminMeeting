import { meetingsSchema } from '../models/meetings';
import { nonmeetingsSchema } from '../models/nonmeeting';
import { selectionsSchema } from '../models/selections';
import { availabilitySlotsSchema } from '../models/availabilitySlot';
import { investorsSchema } from '../models/investors';
import { portfolioCompaniesSchema } from '../models/portfolioCompanies';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { Request, Response } from 'express';

// Create a transporter using SMT


export const deltealldatafromdatabase = async(_req: Request , res: Response) =>{
  try {
    //delete all data from the database
     await meetingsSchema.destroy({
            truncate: true
          });
          await nonmeetingsSchema.destroy({
            truncate: true
          });
          await meetingsSchema.sequelize.query('ALTER SEQUENCE "public"."Meetings_id_seq" RESTART WITH 1');
          await nonmeetingsSchema.sequelize.query('ALTER SEQUENCE "public"."nonMeetings_id_seq" RESTART WITH 1');
          await selectionsSchema.sequelize.query('TRUNCATE "Selections" CASCADE');
          await selectionsSchema.sequelize.query('ALTER SEQUENCE "Selections_SelId_seq" RESTART WITH 1');
          await availabilitySlotsSchema.sequelize.query('TRUNCATE "AvailabilitySlots" CASCADE');
          await availabilitySlotsSchema.sequelize.query('ALTER SEQUENCE "public"."AvailabilitySlots_id_seq" RESTART WITH 1');
          await investorsSchema.sequelize.query('TRUNCATE "Investors" CASCADE');
          await investorsSchema.sequelize.query('ALTER SEQUENCE "public"."Investors_InvId_seq" RESTART WITH 1');
          await portfolioCompaniesSchema.sequelize.query('TRUNCATE "PortfolioCompanies" CASCADE');
          await portfolioCompaniesSchema.sequelize.query('ALTER SEQUENCE "public"."PortfolioCompanies_PFId_seq" RESTART WITH 1');


    sendResponse(res, 200, { message: 'All data deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
}

