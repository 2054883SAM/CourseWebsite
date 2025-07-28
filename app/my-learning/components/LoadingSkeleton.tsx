'use client';

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
}

export default function LoadingSkeleton({ viewMode }: LoadingSkeletonProps) {
  // Generate array of placeholder items
  const skeletons = Array(6).fill(null);

  return (
    <div
      className={`
        ${
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col space-y-4'
        }
      `}
    >
      {skeletons.map((_, index) => (
        viewMode === 'grid' ? (
          // Grid skeleton
          <div key={index} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="pt-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          // List skeleton
          <div key={index} className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="w-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="flex-1 p-4 space-y-3">
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="pt-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
} 