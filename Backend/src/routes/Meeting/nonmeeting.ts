import express from 'express';
import { getAllnonMeetings } from '../../controller/nonmeeting';

const router = express.Router();

router.get('/', getAllnonMeetings);


export default router;

