import express from 'express';
import { getAllSelections, getSelectionById, createSelection, updateSelection, deleteSelection, generateSelections , userselected } from '../../controller/selectionController';

const router = express.Router();

router.get('/', getAllSelections);
router.get('/:id', getSelectionById);
router.post('/', createSelection);
router.put('/:id', updateSelection);
router.delete('/:id', deleteSelection);
router.post('/generateselections', generateSelections);
router.post('/userselected', userselected);
export default router;

