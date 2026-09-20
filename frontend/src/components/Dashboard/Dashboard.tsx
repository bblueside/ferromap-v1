import { StaticsCard } from "./StaticsCard"
import { ChartBarDefault, type BarChartEntry } from "./BarChartDefault"
import { ChartBarMultiple } from "./BarMutilpleChart"
import { PieChartDonut } from "./PieChartDonut"
import { ChartLine } from "./LineChart"
import { Button } from "../ui/button"
import GenerateReportModal from "./ReportModal"
import { FileOutput } from "lucide-react"
import { useState } from "react"
import PosTable from "./DataTable"
import { DashboardScope } from "@/services/dashboard/DashboardScope";
import { useDashboard } from "@/services/dashboard/useDashboard";


// ── Configs estáticas que no vienen de la API ──────────────────────────────────
import {
    pieChartConfig,
    lineChartConfig,
    barChartTitle, barChartDescription,
    barMultipleChartTitle, barMultipleChartDescription,
    pieChartTitleAgent, pieChartDescriptionAgent,
    donutChartTitleCompleteness, donutChartDescriptionCompleteness,
    CoverageChartConfig,
    lineChartTitle, lineChartDescription, lineChartData
} from "./chartConfig"
import { ApiStateLoading, ApiStateError } from "@/hooks/ApiStateWrapper"

function getBarChartDataFromZones(zones: { name: string; potential_score: number }[]): BarChartEntry[] {
    return zones.map((zone) => ({
        name: zone.name,
        value: zone.potential_score,
    }))
}

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
    const { kpis, ferromapvsferreterias, registrosagente, coberturaferreteria, zones } = dashboard

    return (
        <>
            {showReport && <GenerateReportModal onClose={() => setShowReport(false)} />}

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

                {/* ── KPIs ────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                    <StaticsCard value={kpis.totalFerreterias} title="Total de Ferreterias" />
                    <StaticsCard value={kpis.totalContactos} title="Total de ferreterias contactables" />
                </div>

                {/* ── Bar Charts ──────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                    <ChartBarDefault
                        data={getBarChartDataFromZones(zones.slice(0, 5))}
                        title={barChartTitle}
                        description={barChartDescription}
                    />
                    <ChartBarMultiple
                        data={ferromapvsferreterias}
                        title={barMultipleChartTitle}
                        description={barMultipleChartDescription}
                    />
                </div>

                {/* ── Pie / Donut Charts ──────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                    <PieChartDonut
                        data={registrosagente}
                        config={pieChartConfig}
                        title={pieChartTitleAgent}
                        description={pieChartDescriptionAgent}
                    />
                    <PieChartDonut
                        data={coberturaferreteria}
                        config={CoverageChartConfig}
                        title={donutChartTitleCompleteness}
                        description={donutChartDescriptionCompleteness}
                        showCenterLabel={false}
                    />
                </div>

                {/* ── Line Chart ──────────────────────────────────────────────── */}

                {/* ── DataTable ───────────────────────────────────────────────── */}
                <PosTable />
            </div>
        </>
    )
}