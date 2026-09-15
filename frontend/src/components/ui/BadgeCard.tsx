import { cn } from "@/lib/utils"
import * as React from "react"

export interface BadgeCardProps extends React.HTMLAttributes<HTMLSpanElement> {
    label: string
}

export const BadgeCard = React.forwardRef<HTMLSpanElement, BadgeCardProps>(
    ({ label, className, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn("ui-badge-card", className)}
                {...props}
            >
                {label}
            </span>
        )
    }
)
BadgeCard.displayName = "BadgeCard"