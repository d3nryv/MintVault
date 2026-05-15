import { Request, Response } from "express";
import { GetMarketStatisticsUseCase } from "../../../application/use-cases/statistics/get-market-statistics.use-case";

export class StatisticsController {
    constructor(private getMarketStatisticsUseCase: GetMarketStatisticsUseCase) {}

    async getMarketStatistics(req: Request, res: Response) {
        try {
            const language = req.query.language as string;
            const stats = await this.getMarketStatisticsUseCase.execute(language);
            res.json(stats);
        } catch (error) {
            console.error("Error fetching market statistics:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
