import { KPI } from "../model/kpi.model.js";

const getAllKpis = async (req, res) => {
    try {
        const allKpis = await KPI.find();
        res.status(200).json(allKpis);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

export { getAllKpis };
