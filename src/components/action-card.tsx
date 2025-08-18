'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import Link from 'next/link';

interface ActionCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    buttonText: string;
    href: string;
}

export default function ActionCard({ icon: Icon, title, description, buttonText, href }: ActionCardProps) {
    return (
        <Card className="action-card transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
            <CardHeader className="items-center pb-4">
                <div className="icon">
                    <Icon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <CardDescription className="text-center h-12">{description}</CardDescription>
                <Button asChild>
                    <Link href={href}>{buttonText}</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
