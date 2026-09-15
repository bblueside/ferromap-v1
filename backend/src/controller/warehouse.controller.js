import { Warehouse } from "../model/warehouse.model.js";

const getAllWarehouse = async (req, res) => {
    try {
        const AllWarehouse = await Warehouse.find();
        res.status(200).json(AllWarehouse);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error", 
            error
        });
    }
}

export { getAllWarehouse };