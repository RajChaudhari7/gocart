'use client'

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 animate-spin p-1">
        <div className="w-full h-full bg-white rounded-full" />
      </div>
    </div>
  )
}

export default Loading
