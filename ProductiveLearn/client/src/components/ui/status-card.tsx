import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatusCardProps {
  icon: ReactNode;
  iconBgClassName: string;
  iconClassName: string;
  title: string;
  value: string;
  progressLabel?: string;
  progressValue?: number;
  progressMax?: number;
  progressClassName?: string;
}

export function StatusCard({
  icon,
  iconBgClassName,
  iconClassName,
  title,
  value,
  progressLabel = '',
  progressValue = 0,
  progressMax = 100,
  progressClassName = '',
}: StatusCardProps) {
  const percentage = Math.min(Math.round((progressValue / progressMax) * 100), 100);

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${iconBgClassName} ${iconClassName}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        </div>
        {progressLabel && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Today</span>
              <span>{progressLabel}</span>
            </div>
            <Progress value={percentage} className={progressClassName} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
