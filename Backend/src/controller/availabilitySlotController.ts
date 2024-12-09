import { Request, Response } from 'express';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { availabilitySlotsSchema } from '../models/availabilitySlot';
import { selectionsSchema } from '../models/selections';
import { QueryTypes } from 'sequelize';
import { meetingsSchema } from '../models/meetings';

export const getAllAvailabilitySlots = async (_req: Request, res: Response) => {
    try {
      const slots = await availabilitySlotsSchema.findAll();
      sendResponse(res, 200, slots);
    } catch (error) {
      handleError(res, error);
    }
  };
  
  export const getAvailabilitySlotById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const slot = await availabilitySlotsSchema.findByPk(id);
      if (slot) {
        sendResponse(res, 200, slot);
      } else {
        sendResponse(res, 404, { message: 'Availability Slot not found' });
      }
    } catch (error) {
      handleError(res, error);
    }
  };
  

export const createAvailabilitySlot = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      let newSlots;
  
      if (Array.isArray(data.date) || Array.isArray(data.startTime) || Array.isArray(data.endTime)) {
        // Bulk creation
        const slotsData = data.date.map((date: string, index: number) => ({
          date: date,
          startTime: data.startTime[index],
          endTime: data.endTime[index],
          timezone: data.timezone[index]
        }));
        newSlots = await availabilitySlotsSchema.bulkCreate(slotsData);
      } else {
        // Single slot creation
        newSlots = await availabilitySlotsSchema.create(data);
      }
  
      sendResponse(res, 201, newSlots);
    } catch (error) {
      handleError(res, error);
    }
  };
  
  export const updateAvailabilitySlot = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [updatedRowsCount, updatedSlots] = await availabilitySlotsSchema.update(req.body, {
        where: { id },
        returning: true,
      });
      if (updatedRowsCount > 0) {
        sendResponse(res, 200, updatedSlots[0]);
      } else {
        sendResponse(res, 404, { message: 'Availability Slot not found' });
      }
    } catch (error) {
      handleError(res, error);
    }
  };
  
  export const deleteAvailabilitySlot = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedRowsCount = await availabilitySlotsSchema.destroy({
        where: { id },
      });
      if (deletedRowsCount > 0) {
        sendResponse(res, 200, { message: 'Availability Slot deleted successfully' });
      } else {
        sendResponse(res, 404, { message: 'Availability Slot not found' });
      }
    } catch (error) {
      handleError(res, error);
    }
  };

 

  interface Slot {
    startTime: string;
    endTime: string;
  }
  
  interface TransformedSchedule {
    [date: string]: Slot[] | ["NA"];
  }
  
  export const allAvailableSlotsForSelectedSelId = async (req: Request, res: Response) => {
    try {
      const { SelId } = req.body;
      const selection = await selectionsSchema.findByPk(SelId, {
        include: ['Investor', 'PortfolioCompany']
      });
  
      if (!selection) {
        return sendResponse(res, 404, { message: 'Selection not found' });
      }
  
      const { InvTimezone } = selection.Investor;
      const { InvId, PFId } = selection;
  
      const slots = await availabilitySlotsSchema.findAll({
        where: { timezone: InvTimezone }
      });
  
      const transformedData: TransformedSchedule = {};
  
      for (const slot of slots) {
        const { date, startTime, endTime } = slot;
        const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
  
        const query = `
          SELECT *
          FROM "Meetings" m
          INNER JOIN "Selections" s ON m."SelId" = s."SelId"
          WHERE m."SelId" != :SelId
            AND m.date = :date
            AND (
              (m."startTime" < :endTime AND m."endTime" > :startTime)
              AND (
                s."InvId" = :InvId OR s."PFId" = :PFId
              )
            );
        `;
  
        const overlappingMeeting = await meetingsSchema.sequelize.query(query, {
          replacements: {
            SelId,
            date: dateString,
            startTime,
            endTime,
            InvId,
            PFId,
          },
          type: QueryTypes.SELECT,
        });
  
        if (!transformedData[dateString]) {
          transformedData[dateString] = [];
        }
  
        if (overlappingMeeting.length === 0) {
          (transformedData[dateString] as Slot[]).push({ startTime, endTime });
        }
      }
  
      // Mark dates with no available slots as ["NA"]
      for (const dateString in transformedData) {
        if (transformedData[dateString].length === 0) {
          transformedData[dateString] = ["NA"];
        }
      }
  
      sendResponse(res, 200, transformedData);
    } catch (error) {
      handleError(res, error);
    }
  };
  
  

