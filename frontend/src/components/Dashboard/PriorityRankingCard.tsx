import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PRIORITY_META, metaFor, toneClass } from "@/constants"
import type { PriorityRankingEntry } from "@/services/pos/posService"

interface PriorityRankingCardProps {
    data: PriorityRankingEntry[]
    title: string
    description: string
}

export function PriorityRankingCard({ data, title, description }: PriorityRankingCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">#</TableHead>
                            <TableHead>Zona</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Potencial</TableHead>
                            <TableHead className="text-right">Ferreterías</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((zone) => {
                            const meta = metaFor(PRIORITY_META, zone.priority, PRIORITY_META.Baja)
                            return (
                                <TableRow key={zone.id}>
                                    <TableCell className="font-semibold tabular-nums">{zone.ranking}</TableCell>
                                    <TableCell className="max-w-48 truncate" title={zone.name}>{zone.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={toneClass(meta.tone, "badge")}>
                                            {zone.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={toneClass("brand", "bar")}
                                                    style={{ width: `${Math.min(100, zone.potential_score)}%`, height: "100%" }}
                                                />
                                            </div>
                                            <span className="tabular-nums">{zone.potential_score}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {zone.ferreterias_count.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
