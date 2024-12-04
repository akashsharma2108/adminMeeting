import express ,{ Application } from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
dotenv.config();
import routes from './Routes/index';
import cors from 'cors';
import pool from './db/db';




const app: Application = express();
// allow all origins

app.use(cors());
app.use(helmet());

app.use(express.json());

pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release();
  })
  .catch(err => console.error('Database connection error', err));


app.use('/api', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
