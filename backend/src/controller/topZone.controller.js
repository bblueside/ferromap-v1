import { topZone } from "../model/topZones.model.js";


const getAllTopZones = async (req, res) => {
    try {
        const allTopZones = await topZone.find();
        res.status(200).json(allTopZones);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error", 
            error
        });
    }
}

export { getAllTopZones };