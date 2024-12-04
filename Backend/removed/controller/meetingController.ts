import { Request, Response } from 'express';
import  pool  from '../db/db';
import { DateTime } from 'luxon';

export const getMeetings = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM Meetings');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Meetings WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Meeting not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  const { SelId, date, startTime, endTime, duration } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Meetings (SelId, date, startTime, endTime, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [SelId, date, startTime, endTime, duration]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { SelId, date, startTime, endTime, duration } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Meetings SET SelId = $1, date = $2, startTime = $3, endTime = $4, duration = $5 WHERE id = $6 RETURNING *',
      [SelId, date, startTime, endTime, duration, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Meeting not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Meetings WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Meeting not found' });
    } else {
      res.json({ message: 'Meeting deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateSchedule = async (_req: Request, res: Response) => {
  try {
    // Get all selections
    const selectionsResult = await pool.query('SELECT * FROM Selections');
    const selections = selectionsResult.rows;

    // Get all availability slots
    const availabilityResult = await pool.query('SELECT * FROM AvailabilitySlots');
    const availabilitySlots = availabilityResult.rows;

    // Generate meetings
    const meetings = [];
    for (const selection of selections) {
      // const { InvId, PFId } = selection;

      // Find a suitable slot
      const slot = availabilitySlots.find(slot => {
        const startTime = DateTime.fromSQL(slot.startTime);
        const endTime = DateTime.fromSQL(slot.endTime);
        return endTime.diff(startTime, 'minutes').minutes >= 60;
      });

      if (slot) {
        const startTime = DateTime.fromSQL(slot.startTime);
        const endTime = startTime.plus({ minutes: 60 });

        const meeting = {
          SelId: selection.SelId,
          date: slot.date,
          startTime: startTime.toSQL({ includeOffset: false }),
          endTime: endTime.toSQL({ includeOffset: false }),
          duration: 60
        };

        meetings.push(meeting);

        // Remove the used slot
        availabilitySlots.splice(availabilitySlots.indexOf(slot), 1);
      }
    }

    // Insert generated meetings into the database
    for (const meeting of meetings) {
      await pool.query(
        'INSERT INTO Meetings (SelId, date, startTime, endTime, duration) VALUES ($1, $2, $3, $4, $5)',
        [meeting.SelId, meeting.date, meeting.startTime, meeting.endTime, meeting.duration]
      );
    }

    res.json({ message: 'Schedule generated successfully', meetingsCreated: meetings.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

