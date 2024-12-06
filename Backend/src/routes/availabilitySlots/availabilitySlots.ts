import express from 'express';
import { getAllAvailabilitySlots, getAvailabilitySlotById, createAvailabilitySlot, updateAvailabilitySlot, deleteAvailabilitySlot, allAviableSLotforseletedselid } from '../../controller/availabilitySlotController';

const router = express.Router();

router.get('/', getAllAvailabilitySlots);
router.get('/:id', getAvailabilitySlotById);
router.post('/', createAvailabilitySlot);
router.put('/:id', updateAvailabilitySlot);
router.delete('/:id', deleteAvailabilitySlot);
router.post('/allAviableslotforseletedselid', allAviableSLotforseletedselid);


export default router;