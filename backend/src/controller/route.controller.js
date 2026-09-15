import { Route } from "../model/route.model.js";

const getAllRoutes = async (req, res) => {
    try {
        // orden estable para la lista del filtro de rutas
        const allRoutes = await Route.find().sort({ id: 1 });
        res.status(200).json(allRoutes);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

export { getAllRoutes };
