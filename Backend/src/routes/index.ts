/** @format */

import express from "express";
const mainRouter = express.Router();
 import investor from "./investors/investors";
 import portfoliocompanies from "./PortfolioCompanies/PortfolioCompanies"
 import selections from "./Selections/Selections"
 import meetings from "./Meeting/Meeting"
 import availabilityslots from "./availabilitySlots/availabilitySlots"
import nonmeetings from "./Meeting/nonmeeting"


// mainRouter.use(authRouter);

mainRouter.use("/investors", investor);
mainRouter.use("/portfoliocompanies", portfoliocompanies);
mainRouter.use("/selections", selections);
mainRouter.use("/meetings", meetings);
mainRouter.use("/nonmeeting", nonmeetings);
mainRouter.use("/availabilityslots",availabilityslots);

export default mainRouter;
