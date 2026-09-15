"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import { FERROMAP_PALETTE } from "@/constants"
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

export const description = "A multiple bar chart"

const chartConfig = {
    ferromap: {
        label: "Ferreterias atendidas por ferromap",
        color: FERROMAP_PALETTE.blueMedium,
    },
    total: {
        label: "Total de ferreterias",
        color: FERROMAP_PALETTE.blueVibrant,
    },
} satisfies ChartConfig

interface ChartBarMultipleProps {
    data: { name: string; ferromap: number; total: number }[]
    title: string
    description: string
}

export function ChartBarMultiple({ data, title, description }: ChartBarMultipleProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value: string) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="ferromap" fill={chartConfig.ferromap.color} radius={4}>
                            <LabelList
                                position="top"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                        <Bar dataKey="total" fill={chartConfig.total.color} radius={4}>
                            <LabelList
                                position="top"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}