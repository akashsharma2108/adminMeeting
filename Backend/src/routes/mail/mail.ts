import express from 'express';
import { sendMAilto } from '../../controller/mailer';

const router = express.Router();

router.post('/', sendMAilto);


export default router;

