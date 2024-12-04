import express from 'express';
import investorRoutes from './investorRoutes/investorRoutes';
import portfolioCompanyRoutes from './portfolioCompanyRoutes/portfolioCompanyRoutes';
import meetingRoutes from './meetingRoutes/meetingRoutes';
import availabilitySlotRoutes from './availabilitySlotRoutes/availabilitySlotRoutes';
import selectionRoutes from './selectionRoutes/selectionRoutesvalue';



const mainRouter = express.Router();
console.log('reache here');
mainRouter.use('/investors', investorRoutes);
mainRouter.use('/portfolio-companies', portfolioCompanyRoutes);
mainRouter.use('/selections', selectionRoutes);
mainRouter.use('/meetings', meetingRoutes);
mainRouter.use('/availability-slots', availabilitySlotRoutes);


export default mainRouter;
