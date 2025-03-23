import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSubjects, createSubjectSchema, SUBJECT_COLORS } from "@/hooks/use-subjects";

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSubjectDialog({ open, onOpenChange }: AddSubjectDialogProps) {
  const { createSubject } = useSubjects();
  const [selectedColor, setSelectedColor] = useState(
    SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)]
  );

  // Form definition
  const form = useForm({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: "",
      targetTime: 6, // Default to 6 hours
      color: selectedColor,
    },
  });

  // Submit handler
  const onSubmit = async (data: any) => {
    try {
      await createSubject({
        ...data,
        color: selectedColor,
      });
      
      // Reset form
      form.reset({
        name: "",
        targetTime: 6,
        color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
      });
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject to track your study time
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mathematics, Physics, History" {...field} />
                  </FormControl>
                  <FormDescription>The name of the subject you want to track</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Target (hours)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={168} 
                      step={0.5} 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Your weekly study goal for this subject</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Subject Color</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUBJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <FormDescription className="mt-2">
                Pick a color for this subject
              </FormDescription>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Subject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
