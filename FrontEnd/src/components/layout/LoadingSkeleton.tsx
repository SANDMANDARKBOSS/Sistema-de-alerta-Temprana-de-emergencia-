import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full h-full p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="h-full w-full bg-gray-200/50 rounded-xl"></div>
          </div>
        ))}
      </div>

      <div className="h-96 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <div className="h-10 bg-gray-200/50 rounded w-full mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200/30 rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
