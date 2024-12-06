import express from 'express';
import { deltealldatafromdatabase } from '../../controller/delete';

const router = express.Router();

router.post('/', deltealldatafromdatabase);


export default router;