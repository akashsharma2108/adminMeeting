import { Request, Response } from 'express';
import  pool  from '../db/db';

export const getAvailabilitySlots = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM AvailabilitySlots');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAvailabilitySlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM AvailabilitySlots WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Availability Slot not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAvailabilitySlot = async (req: Request, res: Response) => {
  const { timezone, date, startTime, endTime } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO AvailabilitySlots (timezone, date, startTime, endTime) VALUES ($1, $2, $3, $4) RETURNING *',
      [timezone, date, startTime, endTime]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAvailabilitySlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { timezone, date, startTime, endTime } = req.body;
  try {
    const result = await pool.query(
      'UPDATE AvailabilitySlots SET timezone = $1, date = $2, startTime = $3, endTime = $4 WHERE id = $5 RETURNING *',
      [timezone, date, startTime, endTime, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Availability Slot not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAvailabilitySlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM AvailabilitySlots WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Availability Slot not found' });
    } else {
      res.json({ message: 'Availability Slot deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

