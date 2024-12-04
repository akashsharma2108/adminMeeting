import express from 'express';
import { getPortfolioCompanies, getPortfolioCompany, createPortfolioCompany, updatePortfolioCompany, deletePortfolioCompany } from '../../controller/portfolioCompanyController'

const router = express.Router();

router.get('/', getPortfolioCompanies);
router.get('/:id', getPortfolioCompany);
router.post('/', createPortfolioCompany);
router.put('/:id', updatePortfolioCompany);
router.delete('/:id', deletePortfolioCompany);

export default router;

