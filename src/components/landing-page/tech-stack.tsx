export function TechStack() {
  return (
    <div className="mt-16 text-center">
      <p className="text-gray-600 mb-4">Modern Tech Stacks</p>
      <div className="flex flex-wrap justify-center gap-6">
        {['Vite', 'Remix', 'Shadcn', 'React', 'Vercel'].map((tech) => (
          <span key={tech} className="text-gray-800">
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
} 