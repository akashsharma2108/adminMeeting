import { Request, Response } from 'express';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { availabilitySlotsSchema } from '../models/availabilitySlot';
import { selectionsSchema } from '../models/selections';

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

  type Schedule = {
    id: number;
    timezone: string;
    date: string;
    startTime: string;
    endTime: string;
};

type TransformedSchedule = {
    [date: string]: { startTime: string; endTime: string }[];
};

  export const allAviableSLotforseletedselid = async (req: Request, res: Response) => {
    try {
      const { SelId } = req.body;
      const selection = await selectionsSchema.findByPk(SelId, {
        include: ['Investor', 'PortfolioCompany']
      });
        const { InvTimezone } = selection.Investor;
        const slots = await availabilitySlotsSchema.findAll({
          where: { timezone: InvTimezone }
        });
        
        const transformData = (data: Schedule[]): TransformedSchedule => {
            return data.reduce<TransformedSchedule>((acc, item) => {
                const { date, startTime, endTime } = item;
                
                if (!acc[date]) {
                    acc[date] = [];
                }
        
                acc[date].push({ startTime, endTime });
        
                return acc;
            }, {});
        };
     
        const transformedData = transformData(slots as any);

        if (transformedData) {
          sendResponse(res, 200, transformedData);
        } else {
          sendResponse(res, 404, { message: 'Availability Slot not found' });
        }
    } catch (error) {
      handleError(res, error);
    }
  }
