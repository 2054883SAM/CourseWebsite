export function CourseDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Course Header Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-2 relative">
            <div className="h-48 lg:h-64 bg-gray-200"></div>
          </div>
          <div className="lg:col-span-3 p-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-6 w-2/3"></div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="h-6 bg-gray-200 rounded w-36"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area Skeleton */}
        <div className="lg:col-span-2">
          {/* Overview Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              <div className="h-6 bg-gray-200 rounded w-40 mt-6 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              
              <div className="h-6 bg-gray-200 rounded w-36 mt-6 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          
          {/* Curriculum Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Instructor Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 sm:mb-0 sm:mr-6"></div>
                
                <div>
                  <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-24 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Courses Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 