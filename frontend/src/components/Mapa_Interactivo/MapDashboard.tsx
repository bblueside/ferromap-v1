import { AppProviders } from "@/components/AppProviders";
import { InteractiveMap } from "./map";
import { Sidebar } from "./filters";
import { PotentialPanel, SearchZones } from "./panels";

export function MapDashboard() {
    return (
        <AppProviders>
            <div className="relative h-full w-full overflow-hidden">
                <div className="fixed inset-0 z-0">
                    <InteractiveMap />
                </div>
                <div className="relative z-10 flex pointer-events-none h-full">
                    <Sidebar />
                    <main className="flex-1 pl-24 pt-24 pr-8 pointer-events-none">
                        <div className="pointer-events-auto">
                            <PotentialPanel />
                            <SearchZones />
                        </div>
                    </main>
                </div>
            </div>
        </AppProviders>
    );
}