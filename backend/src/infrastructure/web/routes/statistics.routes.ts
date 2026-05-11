import { Router } from "express";
import { StatisticsController } from "../controllers/statistics.controller";
import { GetMarketStatisticsUseCase } from "../../../application/use-cases/statistics/get-market-statistics.use-case";
import { PostgresTransactionRepository } from "../../repositories/pg-transaction.repository";
import { PostgresSaleRepository } from "../../repositories/pg-sale.repository";

const router = Router();

const transactionRepository = new PostgresTransactionRepository();
const saleRepository = new PostgresSaleRepository();
const getMarketStatisticsUseCase = new GetMarketStatisticsUseCase(transactionRepository, saleRepository);
const statisticsController = new StatisticsController(getMarketStatisticsUseCase);

router.get("/", (req, res) => statisticsController.getMarketStatistics(req, res));

export default router;
