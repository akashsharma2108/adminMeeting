import express from 'express';
import { getAvailabilitySlots, getAvailabilitySlot, createAvailabilitySlot, updateAvailabilitySlot, deleteAvailabilitySlot } from '../../controller/availabilitySlotController';

const router = express.Router();

router.get('/', getAvailabilitySlots);
router.get('/:id', getAvailabilitySlot);
router.post('/', createAvailabilitySlot);
router.put('/:id', updateAvailabilitySlot);
router.delete('/:id', deleteAvailabilitySlot);

export default router;

