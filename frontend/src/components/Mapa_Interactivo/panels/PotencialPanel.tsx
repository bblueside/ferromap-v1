"use client"

import { useState } from "react"
import { CircleHelp, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Legend } from "./Legend"


export function PotentialPanel() {
    const [isOpen, setIsOpen] = useState(false)


    return (
        <>
            {/* Wrapper — fixed to bottom-left, sized to panel height */}
            <div className="fixed bottom-0 left-20 z-50 flex flex-col items-center">

                {/* Trigger Button — centered on top of the panel */}
                <div className="pb-2">
                    <Button
                        onClick={() => setIsOpen(prev => !prev)}
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white border-slate-200 hover:bg-slate-50 transition-all duration-300"
                    >
                        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Legend Panel — same 40vh height as original, slides in/out */}
                <div className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isOpen ? "h-[40vh]" : "h-0"
                )}>
                    <div className="h-full border border-border rounded-t-xl bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 h-full  w-[280px]">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                            <CircleHelp className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Leyendas</span>
                        </div>
                        <div className="h-full overflow-auto">
                            <Legend />
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}
