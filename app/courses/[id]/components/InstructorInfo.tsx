import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/lib/supabase/types';

interface InstructorInfoProps {
  creator?: User;
}

export function InstructorInfo({ creator }: InstructorInfoProps) {
  if (!creator) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">About the Instructor</h2>
        <div className="text-gray-600 text-center py-4">
          Instructor information not available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">About the Instructor</h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div className="mb-4 sm:mb-0 sm:mr-6">
            {creator.photo_url ? (
              <Image
                src={creator.photo_url}
                alt={creator.name}
                width={80}
                height={80}
                className="rounded-full border-2 border-blue-100"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xl font-semibold">
                {creator.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-1">{creator.name}</h3>
            <p className="text-blue-600 font-medium mb-2">{creator.role === 'creator' ? 'Course Creator' : creator.role === 'admin' ? 'Administrator' : 'Student'}</p>
            
            <div className="flex items-center mt-3">
              <Link 
                href={`/creators/${creator.id}`}
                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-3 rounded-full transition-colors"
              >
                View Profile
              </Link>
              
              <Link 
                href={`/courses?creator=${creator.id}`}
                className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 py-1 px-3 rounded-full transition-colors ml-2"
              >
                View All Courses
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">About</h4>
          <p className="text-gray-700">
            {/* In a real app, this would come from the creator's profile */}
            {creator.name} is a passionate educator with expertise in various fields of technology and programming.
            With years of experience in the industry, they bring practical knowledge and best practices to their courses.
          </p>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Contact</h4>
          <p className="text-gray-700">
            <a 
              href={`mailto:${creator.email}`}
              className="text-blue-600 hover:underline"
            >
              {creator.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 