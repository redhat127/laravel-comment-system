import type { CommentsTable } from '@/types';
import { Ellipsis } from 'lucide-react';
import { DeleteCommentForm } from '../form/comment/delete-comment-form';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const CommentDropdown = ({ comment }: { comment: CommentsTable }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="self-end">
        <Button variant="outline" size="icon-sm">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="p-0">
          <DeleteCommentForm commentId={comment.id} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
