import express, { Application, Request, Response, NextFunction } from 'express';
import config from 'config';
import * as dotenv from 'dotenv';
dotenv.config();
import { isCelebrateError } from 'celebrate';
import routes from './routes/index';
import { logger } from './utils/logger';
const port = config.get<number>('port');
import cors from 'cors';
// import passport from 'passport';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = YAML.load('./swagger.yaml')

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, 
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, 
  })
);

app.use(express.json());
// app.use(passport.initialize());
app.use('/api', routes);
console.log("hii")
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/uploads',express.static('uploads'));

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (isCelebrateError(err)) {
    if (err && err.details) {
      const errorBody = err.details.get('body').details;
      const error: string[] = errorBody.map((er) =>
        er.message.replace(/"/g, '')
      );
      logger.log('debug', `Validation error occurred: ${error[0]}`);
      res.status(422).json({ status: 'failed', error: error[0] });
      return res;
    } else {
      res.status(422).json({ ...err });
      return res;
    }
  } else {
    return next();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
