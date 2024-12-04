import express from 'express';
import { getAllPortfolioCompanies, getPortfolioCompanyById, createPortfolioCompany, updatePortfolioCompany, deletePortfolioCompany } from '../../controller/portfolioCompanyController';

const router = express.Router();

router.get('/', getAllPortfolioCompanies);
router.get('/:id', getPortfolioCompanyById);
router.post('/', createPortfolioCompany);
router.put('/:id', updatePortfolioCompany);
router.delete('/:id', deletePortfolioCompany);

export default router;

