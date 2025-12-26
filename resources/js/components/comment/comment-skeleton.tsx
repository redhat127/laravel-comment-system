import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const CommentCardSkeleton = ({ isReply = false }: { isReply?: boolean }) => {
  return (
    <div className={cn(isReply && 'ml-8 border-l-2 pl-4')}>
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Avatar skeleton */}
              <Skeleton className="h-12 w-12 min-w-12 rounded-full" />
              <div className="mt-1 space-y-2">
                {/* Name skeleton */}
                <Skeleton className="h-4 w-32" />
                {/* Date skeleton */}
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment body skeleton - multiple lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16" /> {/* Like button */}
            <Skeleton className="h-9 w-20" /> {/* Reply button */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CommentListSkeleton = () => {
  return (
    <div className="space-y-4">
      <CommentCardSkeleton />
      <CommentCardSkeleton />
      <CommentCardSkeleton />
      <CommentCardSkeleton />
    </div>
  );
};

export const CommentRepliesSkeleton = () => {
  return (
    <div className="space-y-4">
      <CommentCardSkeleton isReply />
      <CommentCardSkeleton isReply />
      <CommentCardSkeleton isReply />
      <CommentCardSkeleton isReply />
    </div>
  );
};
