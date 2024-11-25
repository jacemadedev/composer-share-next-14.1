interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  const getTransformClass = (index: number) => {
    const patterns = [
      '-rotate-[1.5deg] translate-y-2',     // Slight left tilt
      'rotate-[2.5deg] -translate-y-1',     // Moderate right tilt
      '-rotate-[0.5deg] translate-y-1',     // Very slight left tilt
      'rotate-[1deg] -translate-y-2',       // Minimal right tilt
      '-rotate-[2deg] translate-y-3',       // Medium left tilt
      'rotate-[0.5deg] -translate-y-1',     // Barely noticeable right tilt
    ];
    
    const isRightSide = index >= 3; // Assuming 3 cards on each side
    const patternIndex = isRightSide 
      ? (index - 3) % patterns.length  // Right side starts from beginning
      : (patterns.length - 1 - index) % patterns.length; // Left side reversed

    return patterns[patternIndex];
  };

  return (
    <div className={`
      p-6 relative
      transform transition-all duration-500
      ${getTransformClass(index)}
      hover:rotate-0 hover:translate-y-0
      bg-white
      border border-gray-100
      shadow-sm
      hover:shadow-md
      rounded-2xl
      backdrop-blur-sm
      hover:scale-[1.02]
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