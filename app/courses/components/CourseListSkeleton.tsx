export function CourseListSkeleton() {
  // Generate an array of 5 items for the skeleton
  const skeletonItems = Array(5).fill(0);
  
  return (
    <div className="space-y-4">
      {skeletonItems.map((_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-64 h-48 sm:h-auto bg-gray-200" />
        
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div className="h-7 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-6 bg-gray-200 rounded-full w-24 ml-2" />
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded-full mr-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  );
} 