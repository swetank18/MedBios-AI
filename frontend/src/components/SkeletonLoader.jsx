function SkeletonLoader({ type = 'card' }) {
  const shimmer = 'relative overflow-hidden bg-bg-secondary before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent before:animate-[shimmer_2s_infinite]';

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card !p-4">
            <div className={`h-3 w-12 rounded-full ${shimmer} mx-auto mb-3`} />
            <div className={`h-8 w-16 rounded-lg ${shimmer} mx-auto mb-2`} />
            <div className={`h-3 w-20 rounded-full ${shimmer} mx-auto`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-card flex items-center justify-center py-10">
          <div className={`w-48 h-48 rounded-full ${shimmer}`} />
        </div>
        <div className="lg:col-span-2 glass-card">
          <div className={`h-4 w-32 rounded-full ${shimmer} mb-4`} />
          <div className={`h-64 rounded-xl ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-card">
        <div className={`h-4 w-28 rounded-full ${shimmer} mb-4`} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 mb-3">
            <div className={`h-4 flex-1 rounded-full ${shimmer}`} />
            <div className={`h-4 w-20 rounded-full ${shimmer}`} />
            <div className={`h-4 w-16 rounded-full ${shimmer}`} />
            <div className={`h-4 w-24 rounded-full ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'heatmap') {
    return (
      <div className="glass-card">
        <div className={`h-4 w-36 rounded-full ${shimmer} mb-4`} />
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
          {[...Array(18)].map((_, i) => (
            <div key={i} className={`h-16 rounded-lg ${shimmer}`} />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="glass-card">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl ${shimmer}`} />
          <div className="flex-1">
            <div className={`h-5 w-40 rounded-full ${shimmer} mb-2`} />
            <div className={`h-3 w-32 rounded-full ${shimmer} mb-1`} />
            <div className={`h-3 w-20 rounded-full ${shimmer}`} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className={`h-8 w-12 rounded-lg ${shimmer} mx-auto mb-1`} />
              <div className={`h-2 w-14 rounded-full ${shimmer} mx-auto`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className="glass-card space-y-3">
        <div className={`h-4 w-24 rounded-full ${shimmer} mb-2`} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-full ${shimmer} shrink-0`} />
            <div className="flex-1 space-y-1.5">
              <div className={`h-3 rounded-full ${shimmer}`} style={{ width: `${60 + Math.random() * 30}%` }} />
              <div className={`h-3 rounded-full ${shimmer}`} style={{ width: `${40 + Math.random() * 30}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="glass-card">
      <div className={`h-4 w-32 rounded-full ${shimmer} mb-4`} />
      <div className={`h-20 rounded-lg ${shimmer} mb-3`} />
      <div className={`h-3 w-2/3 rounded-full ${shimmer}`} />
    </div>
  );
}

export default SkeletonLoader;
