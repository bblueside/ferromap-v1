import { AgentRecord } from "../model/agentRecord.model.js";

const getAllAgentRecords = async (req, res) => {
    try {
        const allAgentRecords = await AgentRecord.find();
        res.status(200).json(allAgentRecords);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error
        });
    }
}

export { getAllAgentRecords };
