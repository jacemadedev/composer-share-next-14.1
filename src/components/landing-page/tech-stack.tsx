export function TechStack() {
  return (
    <div className="mt-16 text-center">
      <p className="text-gray-600 mb-4">Create for AI Developers</p>
      <div className="flex flex-wrap justify-center gap-6">
        {['Bolt', 'Cursor', 'v0', 'Replit'].map((tech) => (
          <span key={tech} className="text-gray-800">
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
} 