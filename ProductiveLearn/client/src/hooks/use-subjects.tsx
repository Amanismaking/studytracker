import { createContext, ReactNode, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Subject, insertSubjectSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';

interface SubjectsContextType {
  subjects: Subject[];
  isLoading: boolean;
  error: Error | null;
  createSubject: (data: CreateSubjectData) => Promise<void>;
}

// Extend the schema for UI validation
export const createSubjectSchema = insertSubjectSchema
  .omit({ userId: true })
  .extend({
    color: z.string().optional(),
    targetTime: z.number().min(0).optional(),
  });

type CreateSubjectData = z.infer<typeof createSubjectSchema>;

const SubjectsContext = createContext<SubjectsContextType | null>(null);

// Default subject colors
export const SUBJECT_COLORS = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: subjects = [],
    isLoading,
    error,
  } = useQuery<Subject[], Error>({
    queryKey: ['/api/subjects'],
    // Add real-time updates every 5 seconds
    refetchInterval: 5000,
    // Refresh when window gets focus
    refetchOnWindowFocus: true,
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: CreateSubjectData) => {
      // Assign random color if not specified
      if (!data.color) {
        data.color = SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
      }
      
      // Convert targetTime from hours to seconds if provided
      const targetTime = data.targetTime ? data.targetTime * 3600 : 0;
      
      const res = await apiRequest('POST', '/api/subjects', { 
        ...data,
        targetTime
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      toast({
        title: 'Subject created',
        description: 'Your new subject has been created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating subject',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createSubject = async (data: CreateSubjectData) => {
    await createSubjectMutation.mutateAsync(data);
  };

  return (
    <SubjectsContext.Provider
      value={{
        subjects,
        isLoading,
        error,
        createSubject,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (!context) {
    throw new Error('useSubjects must be used within a SubjectsProvider');
  }
  return context;
}
