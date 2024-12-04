import express from 'express';
import { getMeetings, getMeeting, createMeeting, updateMeeting, deleteMeeting, generateSchedule } from '../../controller/meetingController';

const router = express.Router();

router.get('/', getMeetings);
router.get('/:id', getMeeting);
router.post('/', createMeeting);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/generate', generateSchedule);

export default router;

