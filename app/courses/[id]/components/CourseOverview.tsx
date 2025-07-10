import { Course } from '@/lib/supabase/types';

interface CourseOverviewProps {
  course: Course;
}

export function CourseOverview({ course }: CourseOverviewProps) {
  // This is a placeholder for the rich text description
  // In a real application, you might want to use a markdown parser
  // or a rich text editor component
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
        
        <div className="prose prose-blue max-w-none">
          {/* We're using basic formatting here, but in a real app you might want to render 
              the description as markdown or HTML if it contains rich formatting */}
          <p className="text-gray-700 whitespace-pre-line">
            {course.description}
          </p>
          
          {/* Additional placeholder content to demonstrate formatting */}
          <h3 className="text-lg font-medium mt-6 mb-2">What you'll learn</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Comprehensive understanding of {course.title} fundamentals</li>
            <li>Hands-on experience with practical examples and exercises</li>
            <li>Best practices and industry standards</li>
            <li>How to apply these concepts to real-world scenarios</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-2">Requirements</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Basic understanding of programming concepts</li>
            <li>A computer with internet access</li>
            <li>Enthusiasm to learn and practice</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-6 mb-2">Who this course is for</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Beginners looking to get started with {course.title.split(' ').slice(-1)}</li>
            <li>Intermediate learners wanting to strengthen their skills</li>
            <li>Anyone interested in expanding their knowledge in this area</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 