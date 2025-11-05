import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ isVisible, message = 'Processing...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="text-white text-lg font-medium">{message}</div>
        <div className="text-gray-400 text-sm">Please wait...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
