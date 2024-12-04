import { Sequelize } from "sequelize";
import config from "config";
import { logger } from "../utils/logger";

type DBConfig = {
  host: string;
  port: number;
  userName: string;
  password: string;
  database: string;
};

const dbConfig = config.get<DBConfig>("dbConfig");
export const sequelize = new Sequelize(
  `postgres://${dbConfig.userName}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
  {
    host: dbConfig.host,
    dialect: "postgres",
    logging: false,
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Consider changing this to true in production for better security.
      },
    },
  }
);

sequelize
  .sync()
  .then(() => {
    logger.log("info", "Postgres Connection established successfully.");
  })
  .catch((err: unknown) => {
    console.log(err);
    console.log(`Unable to establish connection: ${err}`);
  });

