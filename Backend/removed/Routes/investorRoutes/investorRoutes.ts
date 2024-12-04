import express from 'express';
import { getInvestors, getInvestor, createInvestor, updateInvestor, deleteInvestor } from '../../controller/investorController';

const router = express.Router();

router.get('/', getInvestors);
router.get('/:id', getInvestor);
router.post('/', createInvestor);
router.put('/:id', updateInvestor);
router.delete('/:id', deleteInvestor);

export default router;

