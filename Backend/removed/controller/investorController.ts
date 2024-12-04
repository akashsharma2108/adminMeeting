import { Request, Response } from 'express';
import  pool  from '../db/db';

export const getInvestors = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM Investors');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvestor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Investors WHERE InvId = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Investor not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInvestor = async (req: Request, res: Response) => {
  const { InvName, InvCompany, InvTimezone } = req.body;
  try {
    console.log(InvName, InvCompany, InvTimezone);
    const result = await pool.query(
      'INSERT INTO Investors (InvName, InvCompany, InvTimezone) VALUES ($1, $2, $3) RETURNING *',
      [InvName, InvCompany, InvTimezone]
    );
    console.log(result);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInvestor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { InvName, InvCompany, InvTimezone } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Investors SET InvName = $1, InvCompany = $2, InvTimezone = $3 WHERE InvId = $4 RETURNING *',
      [InvName, InvCompany, InvTimezone, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Investor not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInvestor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Investors WHERE InvId = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Investor not found' });
    } else {
      res.json({ message: 'Investor deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

