import { Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, data: any) => {
  res.status(statusCode).json(data);
};

export const handleError = (res: Response, error: any) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
};

