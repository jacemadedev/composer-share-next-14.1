interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  position: 'left' | 'right' | 'center';
}

export function FeatureCard({ icon, title, description, position }: FeatureCardProps) {
  return (
    <div className={`
      p-6 relative
      transform transition-all duration-300
      ${position === 'left' ? '-rotate-3' : position === 'right' ? 'rotate-3' : ''}
      bg-white
      border border-gray-100
      shadow-sm
      hover:shadow-md
      rounded-2xl
      backdrop-blur-sm
      hover:-translate-y-1
    `}>
      {/* Icon Container */}
      <div className="flex items-start gap-3">
        <div className="
          flex-shrink-0
          w-10 h-10
          flex items-center justify-center
          bg-white
          border border-gray-100
          shadow-sm
          rounded-xl
        ">
          <span className="text-xl">{icon}</span>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
} 