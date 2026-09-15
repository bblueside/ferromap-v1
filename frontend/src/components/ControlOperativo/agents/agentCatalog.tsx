import { Bot, FolderCog, Globe, Plug, BrainCircuit } from 'lucide-react';
import type { Agent } from '../domain/agent';

/**
 * Catálogo único de agentes, en orden de aparición. Para agregar un agente:
 * añadirlo aquí y registrar su código en `services/agentAdapter.ts`.
 */
export const AGENTS: Agent[] = [
    {
        id: "rag",
        name: "RAG Agent",
        status: "Idle",
        task: "Processing log entries",
        auto: true,
        layoutGroup: "primary",
        variant: "standard",
        hasUpload: true,
        icon: <BrainCircuit className="h-5 w-5 text-slate-600" />,
        file: "XLSX | CSV | PDF | DOCX"
    },
    {
        id: "scraper",
        name: "Web Scraper Agent",
        status: "Idle",
        task: "Scrapping Data on Web",
        auto: true,
        layoutGroup: "primary",
        variant: "standard",
        icon: <Globe className="h-5 w-5 text-slate-600" />,
    },
    {
        id: "agent2",
        name: "Social Media Agent",
        status: "Idle",
        task: "Search Social Media Data",
        auto: true,
        layoutGroup: "primary",
        variant: "standard",
        icon: <FolderCog className="h-5 w-5 text-slate-600" />,
    },
    {
        id: "api",
        name: "API Agent",
        status: "Idle",
        task: "Search Information on Maps API",
        auto: true,
        layoutGroup: "primary",
        variant: "standard",
        icon: <Plug className="h-5 w-5 text-slate-600" />,
    },
    {
        id: "org",
        name: "Data Organizer Agent",
        status: "Idle",
        task: "Organize Data",
        auto: true,
        layoutGroup: "secondary",
        variant: "standard",
        icon: <FolderCog className="h-5 w-5 text-slate-600" />,
    },
    {
        id: "info",
        name: "Input Data Agent",
        status: "Idle",
        task: "Receiving Databases",
        auto: true,
        layoutGroup: "secondary",
        variant: "inputData",
        hasUpload: true,
        icon: <Bot className="h-5 w-5 text-slate-600" />,
        file: "CSV"
    }
];
