'use client'

const Loading = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Animated background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Glass Card */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-10 py-8 rounded-2xl 
                      bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-green-400 border-t-transparent animate-spin"></div>
        </div>

        {/* Text */}
        <p className="text-sm font-medium tracking-wide text-gray-200 animate-pulse">
          Preparing your dashboard…
        </p>
      </div>
    </div>
  )
}

export default Loading
