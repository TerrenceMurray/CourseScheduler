import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Icon className="size-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
