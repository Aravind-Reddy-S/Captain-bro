import React from 'react';
import LogoImg from '../../assets/images/captain-bro-face-pack.png';

export const Loader = ({ fullPage = false }) => {
  const loaderEl = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center animate-float">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        <img src={LogoImg} alt="Logo" className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-sm font-semibold text-neutral-dark opacity-60">
        Fetching fresh items...
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
        {loaderEl}
      </div>
    );
  }

  return loaderEl;
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-3xl border border-neutral-border p-3 flex flex-col gap-3 relative shadow-sm">
      {/* Image Container Placeholder */}
      <div className="w-full h-32 rounded-2xl shimmer"></div>
      
      {/* Info Placeholders */}
      <div className="flex flex-col gap-2 px-1">
        <div className="h-4 w-3/4 rounded-md shimmer"></div>
        <div className="h-3 w-1/2 rounded-md shimmer"></div>
      </div>

      {/* Actions Placeholders */}
      <div className="flex items-center justify-between mt-auto px-1 pt-2">
        <div className="flex flex-col gap-1.5 w-1/2">
          <div className="h-3 w-1/2 rounded-md shimmer"></div>
          <div className="h-4 w-3/4 rounded-md shimmer"></div>
        </div>
        <div className="h-9 w-9 rounded-xl shimmer"></div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default Loader;
