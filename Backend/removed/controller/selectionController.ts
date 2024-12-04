import { Request, Response } from 'express';
import  pool  from '../db/db';

export const getSelections = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM Selections');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSelection = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Selections WHERE SelId = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Selection not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSelection = async (req: Request, res: Response) => {
  const { InvId, PFId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Selections (InvId, PFId) VALUES ($1, $2) RETURNING *',
      [InvId, PFId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSelection = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { InvId, PFId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Selections SET InvId = $1, PFId = $2 WHERE SelId = $3 RETURNING *',
      [InvId, PFId, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Selection not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSelection = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Selections WHERE SelId = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Selection not found' });
    } else {
      res.json({ message: 'Selection deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


