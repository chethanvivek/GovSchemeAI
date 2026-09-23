import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner({ className = '' }) {
  return (
    <div
      className={`bg-amber-50/95 border-b border-amber-200/80 px-4 py-2.5 text-xs sm:text-sm text-amber-900 shadow-sm transition-all ${className}`}
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center sm:text-left">
        <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <p className="font-medium">
          <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded mr-1.5">
            Advisory Notice
          </span>
          Scheme information and AI recommendations are for informational assistance only. Final eligibility and approvals are determined by the respective government authorities.
        </p>
      </div>
    </div>
  );
}
