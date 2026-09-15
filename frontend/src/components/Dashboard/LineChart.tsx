import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface ChartLineProps {
    data: Record<string, string | number>[]
    title: string
    description: string
    lineChartConfig: ChartConfig
}

export function ChartLine({ data, title, description, lineChartConfig }: ChartLineProps) {
    const [dateKey, valueKey] = Object.keys(data[0] ?? {})

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={lineChartConfig}
                    className="h-[420px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={dateKey}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey={valueKey}
                            type="linear"
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}