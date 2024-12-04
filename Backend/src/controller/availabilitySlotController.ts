import { Request, Response } from 'express';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { availabilitySlotsSchema } from '../models/availabilitySlot';

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

