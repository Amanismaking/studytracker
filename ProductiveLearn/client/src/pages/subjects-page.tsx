import { useState } from "react";
import { SidebarLayout } from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AddSubjectDialog } from "@/components/dialogs/add-subject-dialog";
import { useSubjects } from "@/hooks/use-subjects";
import { PlusCircle, Edit, Trash, BookOpen } from "lucide-react";

// Helper function to format seconds into hours and minutes
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function SubjectsPage() {
  const { subjects, isLoading } = useSubjects();
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);

  return (
    <SidebarLayout>
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your study subjects and track their progress</p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <Button className="flex items-center" onClick={() => setShowAddSubjectDialog(true)}>
            <PlusCircle className="w-4 h-4 mr-1" />
            New Subject
          </Button>
        </div>
      </div>

      {/* Subjects grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <div className="mx-auto bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No subjects found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add subjects to track your study time for different topics
            </p>
            <Button onClick={() => setShowAddSubjectDialog(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const targetSeconds = subject.targetTime || 3600 * 6; // Default to 6 hours if no target
            const percentComplete = Math.min(Math.round((subject.totalTime / targetSeconds) * 100), 100);
            
            return (
              <Card key={subject.id} className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: subject.color }}></div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{subject.name}</span>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></div>
                  </CardTitle>
                  <CardDescription>
                    {formatTime(subject.totalTime)} total study time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{percentComplete}%</span>
                  </div>
                  <Progress 
                    value={percentComplete} 
                    className="h-2.5" 
                    indicatorClassName="bg-current" 
                    style={{ color: subject.color }}
                  />
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                    Weekly target: {formatTime(targetSeconds)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                  <Button variant="outline" size="sm" className="text-gray-500">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Subject Dialog */}
      <AddSubjectDialog 
        open={showAddSubjectDialog} 
        onOpenChange={setShowAddSubjectDialog}
      />
    </SidebarLayout>
  );
}
