import express from 'express';
import { getSelections, getSelection, createSelection, updateSelection, deleteSelection } from '../../controller/selectionController'

const router = express.Router();

router.get('/', getSelections);
router.get('/:id', getSelection);
router.post('/', createSelection);
router.put('/:id', updateSelection);
router.delete('/:id', deleteSelection);

export default router;

