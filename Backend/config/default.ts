import dotenv from 'dotenv';

dotenv.config();
export default {
  port: 4000,
  basePath: "",
  UI_URL: "http://localhost:5173",
  JWTExpiryTime: "30m",
  dbConfig: {
    database: process.env.DB_NAME,
    userName: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
  },
};