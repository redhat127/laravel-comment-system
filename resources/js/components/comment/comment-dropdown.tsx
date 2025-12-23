import type { CommentsTable } from '@/types';
import { Edit, Ellipsis } from 'lucide-react';
import { DeleteCommentForm } from '../form/comment/delete-comment-form';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const CommentDropdown = ({ comment, openEditCommentBox }: { comment: CommentsTable; openEditCommentBox(): void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="self-end" asChild>
        <Button variant="outline" size="icon-sm">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex w-full items-center gap-1.5 px-2 py-1.5 text-primary" onClick={openEditCommentBox}>
          <Edit className="text-inherit" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0">
          <DeleteCommentForm commentId={comment.id} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
