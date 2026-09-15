import * as React from "react"
import { Cell, Label, LabelList, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { CHART_SERIES_COLORS } from "@/constants"

interface PieChartDonutData {
    name: string
    quantity: number
}

interface PieChartDonutProps {
    data: PieChartDonutData[]
    config: ChartConfig
    title: string
    description: string
    showCenterLabel?: boolean
}

export function PieChartDonut({ data, config, title, description, showCenterLabel = true }: PieChartDonutProps) {
    const total = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.quantity, 0)
    }, [data])

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        <Pie
                            data={data}
                            dataKey="quantity"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]}
                                />
                            ))}
                            <LabelList
                                dataKey="quantity"
                                className="fill-background"
                                stroke="none"
                                fontSize={12}
                                fontWeight={600}
                                formatter={(value) => {
                                    const pct = (Number(value) / total) * 100
                                    return Number.isFinite(pct) ? `${pct.toFixed(0)}%` : ""
                                }}
                            />
                            {showCenterLabel && (
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy - 25}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {total.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0)}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Cantidad
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            )}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}