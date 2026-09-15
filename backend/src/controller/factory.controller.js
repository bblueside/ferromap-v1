import { Factory } from "../model/factory.model.js";

const getAllFactories = async (req, res) => {
    try {
        const Allfactories = await Factory.find();
        res.status(200).json(Allfactories);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error", 
            error
        });
    }
}

export { getAllFactories };
