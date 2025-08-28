import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    description?: string;
}

export default function StatCard({ icon: Icon, title, subtitle, description }: StatCardProps) {
    return (
        <Card className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md hover:shadow-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {subtitle}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{title}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}
