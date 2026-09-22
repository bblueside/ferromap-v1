import { Button } from "../ui/button"
import { BackendUnavailableModal } from "@/components/shared/modal/BackendUnavailableModal"
import { FileOutput } from "lucide-react"
import { useState } from "react"
import PosTable from "./DataTable"
import { DashboardScope } from "@/services/dashboard/DashboardScope";
import { useDashboard } from "@/services/dashboard/useDashboard";


// ── Configs estáticas que no vienen de la API ──────────────────────────────────
import {
    priorityRankingTitle, priorityRankingDescription,
    statusComparisonTitle, statusComparisonDescription
} from "./chartConfig"
import { PriorityRankingCard } from "./PriorityRankingCard"
import { StatusComparisonCard } from "./StatusComparisonCard"
import { ApiStateLoading, ApiStateError } from "@/hooks/ApiStateWrapper"


export function Dashboard() {
    return (
        <DashboardScope>
            <DashboardContent />
        </DashboardScope>
    )
}

function DashboardContent() {
    const [showReport, setShowReport] = useState(false)
    const { data: dashboard, loading, error } = useDashboard();

    // ── Loading state ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <ApiStateLoading>Cargando datos del dashboard...</ApiStateLoading>
        )
    }

    // ── Error state ────────────────────────────────────────────────────────────
    if (error || !dashboard) {
        return (
            <ApiStateError>{error}</ApiStateError>
        )
    }

    // ── Datos del dashboard ────────────────────────────────────────────────────
    const {
        priorityRanking, statusComparison,
    } = dashboard

    return (
        <>
            {/* Reporte deshabilitado: solo informa que el backend no está disponible. */}
            {showReport && <BackendUnavailableModal onClose={() => setShowReport(false)} />}

            <div className="px-22 pt-25 pb-6 flex flex-col gap-6 max-w-screen-xl mx-auto w-full">

                {/* ── Page header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between py-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="ui-page-title">Dashboard</h1>
                        <p className="ui-page-subtitle">
                            Plataforma de inteligencia de mercado para el seguimiento y
                            análisis del mercado ferretero
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            className="ui-btn-brand"
                            onClick={() => setShowReport(true)}
                        >
                            <FileOutput size={14} />
                            Generar reporte
                        </Button>
                    </div>
                </div>
                
                {/* ── Estado operativo y ranking por prioridad ────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                    <StatusComparisonCard
                        data={statusComparison}
                        title={statusComparisonTitle}
                        description={statusComparisonDescription}
                    />
                    <PriorityRankingCard
                        data={priorityRanking}
                        title={priorityRankingTitle}
                        description={priorityRankingDescription}
                    />
                </div>
                <PosTable />
            </div>
        </>
    )
}