import { PosCoverage } from "../model/posCoverage.model.js";

const getAllPosCoverage = async (req, res) => {
    try {
        const allPosCoverage = await PosCoverage.find();
        res.status(200).json(allPosCoverage);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

export { getAllPosCoverage };
