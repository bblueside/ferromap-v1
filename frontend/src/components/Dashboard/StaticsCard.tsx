import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface StaticsCardProps {
    value: string
    title: string
}

export function StaticsCard({ value, title }: StaticsCardProps) {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                <CardAction>
                </CardAction>
            </CardHeader>
        </Card>
    )
}