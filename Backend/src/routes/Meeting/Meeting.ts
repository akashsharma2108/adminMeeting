import express from 'express';
import { getAllMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting, generateMeetingSchedule } from '../../controller/meetingController';

const router = express.Router();

router.get('/', getAllMeetings);
router.get('/:id', getMeetingById);
router.post('/', createMeeting);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/generate', generateMeetingSchedule);

export default router;

