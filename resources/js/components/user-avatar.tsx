import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export const UserAvatar = ({ widthHeightClassNames }: { widthHeightClassNames?: string }) => {
  const { name, avatar } = useAuth()!;
  return (
    <div className={cn('overflow-hidden rounded-full', widthHeightClassNames, { 'h-8 w-8 min-w-8': !widthHeightClassNames })}>
      {avatar ? (
        <img src={avatar} alt={`${name} avatar`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-red-600 text-white capitalize">{name[0]}</div>
      )}
    </div>
  );
};
