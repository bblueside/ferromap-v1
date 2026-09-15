import { Pos } from "../model/pos.model.js";


const getAllPos = async (req, res) => {
    try {
        const Allpos = await Pos.find();
        res.status(200).json(Allpos);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error", 
            error
        });
    }
}


export { getAllPos };