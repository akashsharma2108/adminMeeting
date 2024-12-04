import { Request, Response } from 'express';
import  pool  from '../db/db';

export const getPortfolioCompanies = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM PortfolioCompanies');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPortfolioCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM PortfolioCompanies WHERE PFId = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Portfolio Company not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPortfolioCompany = async (req: Request, res: Response) => {
  const { PFName, PFCompany, PFTimezone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO PortfolioCompanies (PFName, PFCompany, PFTimezone) VALUES ($1, $2, $3) RETURNING *',
      [PFName, PFCompany, PFTimezone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePortfolioCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { PFName, PFCompany, PFTimezone } = req.body;
  try {
    const result = await pool.query(
      'UPDATE PortfolioCompanies SET PFName = $1, PFCompany = $2, PFTimezone = $3 WHERE PFId = $4 RETURNING *',
      [PFName, PFCompany, PFTimezone, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Portfolio Company not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePortfolioCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM PortfolioCompanies WHERE PFId = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Portfolio Company not found' });
    } else {
      res.json({ message: 'Portfolio Company deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

