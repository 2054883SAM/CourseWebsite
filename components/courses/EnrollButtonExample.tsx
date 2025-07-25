'use client';

import React, { useState } from 'react';
import EnrollButton from './EnrollButton';

export const EnrollButtonExample: React.FC = () => {
  const [status, setStatus] = useState<'not-enrolled' | 'processing' | 'enrolled'>('not-enrolled');
  
  const handleEnroll = () => {
    // Simulate enrollment process
    setStatus('processing');
    
    // Simulate API call with timeout
    setTimeout(() => {
      setStatus('enrolled');
    }, 2000);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-6">EnrollButton Component Demo</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium mb-3">Current State: {status}</h3>
          <EnrollButton 
            status={status} 
            onClick={handleEnroll}
            tooltipText={
              status === 'not-enrolled' 
                ? "Click to enroll in this course" 
                : status === 'processing' 
                ? "Processing your enrollment..."
                : "You're already enrolled in this course"
            }
          />
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-md font-medium mb-3">All States:</h3>
          <div className="flex flex-wrap gap-4">
            <EnrollButton status="not-enrolled" tooltipText="Not enrolled state" />
            <EnrollButton status="processing" tooltipText="Processing state" />
            <EnrollButton status="enrolled" tooltipText="Enrolled state" />
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-md font-medium mb-3">Custom Text:</h3>
          <div className="flex flex-wrap gap-4">
            <EnrollButton 
              notEnrolledText="Join Course" 
              processingText="Joining..." 
              enrolledText="Joined"
              tooltipText="Custom text example"
            />
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-md font-medium mb-3">Disabled State:</h3>
          <EnrollButton disabled tooltipText="This button is disabled" />
        </div>
      </div>
    </div>
  );
};

export default EnrollButtonExample; 