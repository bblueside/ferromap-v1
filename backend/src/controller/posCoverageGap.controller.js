import { PosCoverageGap } from "../model/posCoverageGap.model.js";

const getAllPosCoverageGap = async (req, res) => {
    try {
        const allPosCoverageGap = await PosCoverageGap.find();
        res.status(200).json(allPosCoverageGap);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

export { getAllPosCoverageGap };
