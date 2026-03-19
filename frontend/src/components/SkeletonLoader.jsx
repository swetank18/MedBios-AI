function SkeletonLoader({ type = 'card' }) {
  const shimmer = 'animate-pulse bg-white/[0.04]';

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card !p-4">
            <div className={`h-8 w-16 rounded ${shimmer} mx-auto mb-2`} />
            <div className={`h-3 w-20 rounded ${shimmer} mx-auto`} />
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
          <div className={`h-4 w-32 rounded ${shimmer} mb-4`} />
          <div className={`h-64 rounded-xl ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-card">
        <div className={`h-4 w-28 rounded ${shimmer} mb-4`} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 mb-3">
            <div className={`h-4 flex-1 rounded ${shimmer}`} />
            <div className={`h-4 w-20 rounded ${shimmer}`} />
            <div className={`h-4 w-16 rounded ${shimmer}`} />
            <div className={`h-4 w-24 rounded ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'heatmap') {
    return (
      <div className="glass-card">
        <div className={`h-4 w-36 rounded ${shimmer} mb-4`} />
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
          {[...Array(18)].map((_, i) => (
            <div key={i} className={`h-16 rounded-lg ${shimmer}`} />
          ))}
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="glass-card">
      <div className={`h-4 w-32 rounded ${shimmer} mb-4`} />
      <div className={`h-20 rounded-lg ${shimmer} mb-3`} />
      <div className={`h-3 w-2/3 rounded ${shimmer}`} />
    </div>
  );
}

export default SkeletonLoader;
