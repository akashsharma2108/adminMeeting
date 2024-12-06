import { Request, Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import { sendResponse, handleError } from '../utils/controllerUtils';
import { meetingsSchema } from '../models/meetings';
 import { nonmeetingsSchema } from '../models/nonmeeting';
import { selectionsSchema } from '../models/selections';
import { availabilitySlotsSchema } from '../models/availabilitySlot';
import { investorsSchema } from '../models/investors';
import { portfolioCompaniesSchema } from '../models/portfolioCompanies';


export const getAllMeetings = async (_req: Request, res: Response) => {
  try {
    const meetings = await meetingsSchema.findAll({
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

export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = await meetingsSchema.findByPk(id, {
      include: [{
        model: selectionsSchema,
        include: ['Investor', 'PortfolioCompany']
      }]
    });
    if (meeting) {
      sendResponse(res, 200, meeting);
    } else {
      sendResponse(res, 404, { message: 'Meeting not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { SelId, date, startTime, endTime, duration } = req.body;

    // Validate the selection exists
    const selection = await selectionsSchema.findByPk(SelId, {
      include: ['Investor', 'PortfolioCompany']
    });

    if (!selection) {
      return sendResponse(res, 400, { message: 'Invalid Selection ID' });
    }

    // Check for overlapping meetings
    const overlappingMeeting = await meetingsSchema.findOne({
      where: {
        SelId,
        date,
        [Op.or]: [
          {
            startTime: {
              [Op.lt]: endTime
            },
            endTime: {
              [Op.gt]: startTime
            }
          }
        ]
      }
    });

    if (overlappingMeeting) {
      return sendResponse(res, 400, { message: 'Overlapping meeting exists' });
    }

    // Check if the meeting time is within available slots
    const investorSlot = await availabilitySlotsSchema.findOne({
      where: {
        timezone: selection.Investor.InvTimezone,
        date,
        startTime: {
          [Op.lte]: startTime
        },
        endTime: {
          [Op.gte]: endTime
        }
      }
    });

    const pfSlot = await availabilitySlotsSchema.findOne({
      where: {
        timezone: selection.PortfolioCompany.PFTimezone,
        date,
        startTime: {
          [Op.lte]: startTime
        },
        endTime: {
          [Op.gte]: endTime
        }
      }
    });

    if (!investorSlot || !pfSlot) {
      return sendResponse(res, 400, { message: 'Meeting time is not within available slots' });
    }

    const newMeeting = await meetingsSchema.create({
      SelId,
      date,
      startTime,
      endTime,
      duration
    });

    sendResponse(res, 201, newMeeting);
  } catch (error) {
    handleError(res, error);
  }
};


export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { SelId, date, startTime, endTime, duration } = req.body;

    const selection = await selectionsSchema.findByPk(SelId, {
      include: ['Investor', 'PortfolioCompany']
    });

    if (!selection) {
      return sendResponse(res, 400, { message: 'Invalid Selection ID' });
    }

    const { InvId } = selection.Investor;
    const { PFId } = selection.PortfolioCompany;

    const query = `
    SELECT *
    FROM "Meetings" m
    INNER JOIN "Selections" s ON m."SelId" = s."SelId"
    WHERE m.id != :id
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
      id, 
      date, 
      startTime, 
      endTime, 
      InvId, 
      PFId, 
    },
    type: QueryTypes.SELECT,
  });
  
  if (overlappingMeeting.length > 0) {
    return sendResponse(res, 400, { message: 'Overlapping meeting exists' });
  }
  
    const investorSlot = await availabilitySlotsSchema.findOne({
      where: {
        timezone: selection.Investor.InvTimezone,
        date,
        startTime: { [Op.lte]: startTime },
        endTime: { [Op.gte]: endTime }
      }
    });

    const pfSlot = await availabilitySlotsSchema.findOne({
      where: {
        timezone: selection.PortfolioCompany.PFTimezone,
        date,
        startTime: { [Op.lte]: startTime },
        endTime: { [Op.gte]: endTime }
      }
    });

    if (!investorSlot || !pfSlot) {
      return sendResponse(res, 400, { message: 'Meeting time is not within available slots' });
    }

    // Update the meeting
    const [updatedRowsCount, updatedMeetings] = await meetingsSchema.update(
      { SelId, date, startTime, endTime, duration },
      {
        where: { id },
        returning: true,
      }
    );

    if (updatedRowsCount > 0) {
      return sendResponse(res, 200, updatedMeetings[0]);
    } else {
      return sendResponse(res, 404, { message: 'Meeting not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};


export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await meetingsSchema.destroy({
      where: { id },
    });
    if (deletedRowsCount > 0) {
      sendResponse(res, 200, { message: 'Meeting deleted successfully' });
    } else {
      sendResponse(res, 404, { message: 'Meeting not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
};

async function scheduleMeetings(availableSlots, selectionData) {
  const scheduledMeetings = [];
  const investorMeetings = new Map();
  const pfMeetings = new Map();
  const allInvIds = new Set(selectionData.map(s => s.InvId));
  const allPFIds = new Set(selectionData.map(s => s.PFId));
  const leftOutPFIds = new Set(allPFIds);

  for (const invId of allInvIds) {
    for (const pfId of allPFIds) {
      const selection = selectionData.find(s => s.InvId === invId && s.PFId === pfId);
      if (!selection) continue;

      let scheduled = false;
      for (const slot of availableSlots) {
        const slotKey = `${slot.date}-${slot.startTime}`;
        if (!investorMeetings.has(`${invId}-${slotKey}`) && !pfMeetings.has(`${pfId}-${slotKey}`)) {
          scheduledMeetings.push({
            selid: selection.SelId,
            pfid: pfId,
            invid: invId,
            date: slot.date,
            starttime: slot.startTime,
            endtime: slot.endTime,
            duration: 60
          });
          investorMeetings.set(`${invId}-${slotKey}`, true);
          pfMeetings.set(`${pfId}-${slotKey}`, true);
          leftOutPFIds.delete(pfId);
          scheduled = true;
          break;
        }
      }

      if (!scheduled) {
        leftOutPFIds.add(pfId);
      }
    }
  }

  return {
    scheduledMeetings,
    leftOutPFIds: Array.from(leftOutPFIds)
  };
}

async  function findConflicts(data) {
  const conflicts = [];
  const nonConflicts = [];

  // Helper function to convert time to minutes for easier comparison
  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper function to check if two time ranges overlap
  function isOverlapping(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  // Iterate through each timezone
  for (let i = 0; i < data.length; i++) {
    const timezone1 = data[i];
    
    // Compare with other timezones
    for (let j = i + 1; j < data.length; j++) {
      const timezone2 = data[j];
      // Compare slots between the two timezones
      for (const slot1 of timezone1.data) {
        for (const slot2 of timezone2.data) {
          // Check if pfid or invid match and if the dates are the same
          if ((slot1.pfid === slot2.pfid || slot1.invid === slot2.invid) && slot1.date === slot2.date) {
            const start1 = timeToMinutes(slot1.starttime);
            const end1 = timeToMinutes(slot1.endtime);
            const start2 = timeToMinutes(slot2.starttime);
            const end2 = timeToMinutes(slot2.endtime);
            
            // Check for overlap
            if (isOverlapping(start1, end1, start2, end2)) {
              conflicts.push(slot1); // conflict.push(slot2);
            }
          }
        }
      }
    }

    for (const slot of timezone1.data) {
      if (!conflicts.includes(slot)) {
        nonConflicts.push(slot);
      }
    }
  }
  
  return { conflicts, nonConflicts };
}

export const generateMeetingSchedule = async (_req: Request, res: Response) => {
    try {
      await meetingsSchema.destroy({
        truncate: true
      });
      await nonmeetingsSchema.destroy({
        truncate: true
      });
      await meetingsSchema.sequelize.query('ALTER SEQUENCE "public"."Meetings_id_seq" RESTART WITH 1');
      await nonmeetingsSchema.sequelize.query('ALTER SEQUENCE "public"."nonMeetings_id_seq" RESTART WITH 1');


    const selectiondata = await selectionsSchema.findAll({
      include: [
        { model: investorsSchema, as: 'Investor' },
        { model: portfolioCompaniesSchema, as: 'PortfolioCompany' }
      ]
    });
    const getAllAvailabilitySlots = await availabilitySlotsSchema.findAll();
   
      
        async function allavailableSlotsforeverytimezone (timezone)  {
          const slot = getAllAvailabilitySlots.filter((slot) => slot.timezone === timezone);
          const slectionfilter = selectiondata.filter((slot) => slot.Investor.InvTimezone === timezone);
          const stringifydata = JSON.stringify(slectionfilter);
        return {slot, stringifydata};
        }
        
        const timezone = getAllAvailabilitySlots.map((slot) => slot.timezone);
        const uniqueTimezone = [...new Set(timezone)];

        const finaldata = [];
      
        for (const timezone of uniqueTimezone) {
          try {
            const datas = await allavailableSlotsforeverytimezone(timezone);
            const scheduledMeetings = await scheduleMeetings(datas.slot, JSON.parse(datas.stringifydata));
            finaldata.push({
              timezone,
              data: scheduledMeetings.scheduledMeetings,  //[ gmt :]
            });
          } catch (error) {
            console.error(`Error processing timezone ${timezone}:`, error);
          }
        }
       
        const conflicts = await findConflicts(finaldata);
        const mappedMeetings = conflicts.nonConflicts.map(meeting => ({
          SelId: meeting.selid,
          date: meeting.date,
          startTime: meeting.starttime,
          endTime: meeting.endtime,
          duration: meeting.duration
        }));

        const mapnonmeetings = conflicts.conflicts.map(meeting => ({
          SelId: meeting.selid,
          date: meeting.date,
          startTime: meeting.starttime,
          endTime: meeting.endtime,
          duration: meeting.duration
        }));
        const scheduledMeetings = await meetingsSchema.bulkCreate(mappedMeetings);
        const nonmeetings = await nonmeetingsSchema.bulkCreate(mapnonmeetings);
        sendResponse(res, 201, {
          totalmeetingsScheduled: scheduledMeetings.length,
          scheduledMeetings : scheduledMeetings,
          leftOutMeetings: nonmeetings
        })


    } catch (error) {
      handleError(res, error);
    }

}


export const getUnscheduledMeetings = async (_req: Request, res: Response) => {
  try {
    const getallselIDfromMeetings = await meetingsSchema.findAll();
    const getallselIdfromNonMeetings = await nonmeetingsSchema.findAll();
    const selid = getallselIDfromMeetings.map((selid) => selid.SelId);
    const selidnonmeetings = getallselIdfromNonMeetings.map((selid) => selid.SelId);
    const allselid = selid.concat(selidnonmeetings);
    const newselid = [...new Set(allselid)];
    const selectiondata = await selectionsSchema.findAll({
      where: {
        SelId: {
          [Op.notIn]: newselid
        }
      },
      include: [
        { model: investorsSchema, as: 'Investor' },
        { model: portfolioCompaniesSchema, as: 'PortfolioCompany' }
      ]
    });
  
    sendResponse(res, 200, selectiondata);
  } catch (error) {
    handleError(res, error);
  }
}


