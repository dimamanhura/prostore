'use client';

import { useState, useTransition } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";

interface DeleteDialogProps {
  id: string;
  action: (id: string) => Promise<{ success: boolean; message: string }>;
};

const DeleteDialog = ({ id, action }: DeleteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition(); 

  const handleDelete = () => {
    startTransition(async () => {
      const res = await action(id);
      if (res.success) {
        setIsOpen(false);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size={'sm'} variant={'destructive'} className="ml-2">
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can not be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant={'destructive'} size={'sm'} disabled={pending} onClick={handleDelete}>
            {pending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
