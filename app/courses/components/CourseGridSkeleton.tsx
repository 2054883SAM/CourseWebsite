export function CourseGridSkeleton() {
  // Generate an array of 8 items for the skeleton
  const skeletonItems = Array(8).fill(0);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletonItems.map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="h-48 bg-gray-200" />
      
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-1 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 rounded-full mr-2" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
} 