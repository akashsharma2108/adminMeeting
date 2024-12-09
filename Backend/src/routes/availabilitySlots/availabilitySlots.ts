import express from 'express';
import { getAllAvailabilitySlots, getAvailabilitySlotById, createAvailabilitySlot, updateAvailabilitySlot, deleteAvailabilitySlot, allAvailableSlotsForSelectedSelId } from '../../controller/availabilitySlotController';

const router = express.Router();

router.get('/', getAllAvailabilitySlots);
router.get('/:id', getAvailabilitySlotById);
router.post('/', createAvailabilitySlot);
router.put('/:id', updateAvailabilitySlot);
router.delete('/:id', deleteAvailabilitySlot);
router.post('/allAviableslotforseletedselid', allAvailableSlotsForSelectedSelId);


export default router;