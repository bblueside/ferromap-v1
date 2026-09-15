import { AgentLog } from "../model/agentLog.model.js";

const getAllAgentsLog = async (req, res) => {
    try {
        // ejecuciones mas recientes primero
        const allAgentsLog = await AgentLog.find().sort({ createdAt: -1 });
        res.status(200).json(allAgentsLog);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

export { getAllAgentsLog };
