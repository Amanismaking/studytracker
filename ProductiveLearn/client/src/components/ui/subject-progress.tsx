import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSubjects } from '@/hooks/use-subjects';

// Function to format time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function SubjectProgress() {
  const { subjects } = useSubjects();

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
        <CardTitle>Subject Progress</CardTitle>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span>This Week</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {subjects.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>No subjects found. Add a subject to start tracking progress.</p>
          </div>
        ) : (
          subjects.map((subject) => {
            const targetSeconds = subject.targetTime || 3600 * 6; // Default to 6 hours if no target
            const percentComplete = Math.min(Math.round((subject.totalTime / targetSeconds) * 100), 100);
            
            return (
              <div key={subject.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(subject.totalTime)} / {formatTime(targetSeconds)}
                  </span>
                </div>
                <Progress 
                  value={percentComplete} 
                  className="h-2.5" 
                  indicatorClassName="bg-current" 
                  style={{ color: subject.color }}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
