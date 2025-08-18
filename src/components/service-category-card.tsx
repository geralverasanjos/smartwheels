'use client';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { useCurrency } from '@/lib/currency';

interface ServiceCategoryCardProps {
  service: {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    price: number;
    eta: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export default function ServiceCategoryCard({ service, isSelected, onSelect }: ServiceCategoryCardProps) {
    const { language } = useAppContext();
    const { formatCurrency } = useCurrency(language.value);

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all',
        isSelected ? 'border-primary ring-2 ring-primary' : 'hover:bg-accent'
      )}
    >
      <service.icon className="h-10 w-10 flex-shrink-0 text-primary" />
      <div className="flex-1">
        <h3 className="font-bold">{service.title}</h3>
        <p className="text-sm text-muted-foreground">{service.description}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatCurrency(service.price)}</p>
        <p className="text-sm text-muted-foreground">{service.eta}</p>
      </div>
    </div>
  );
}
