/**
 * Neural Network Background Component
 * Subtle TAI brand visual element inspired by the neural network concept
 * in the TAI logo. Used sparingly for hero sections and impact moments.
 */

interface NeuralNetworkBackgroundProps {
  variant?: 'subtle' | 'prominent'
  className?: string
}

export function NeuralNetworkBackground({ 
  variant = 'subtle',
  className = '' 
}: NeuralNetworkBackgroundProps) {
  const opacity = variant === 'subtle' ? 0.03 : 0.06
  const nodeCount = variant === 'subtle' ? 12 : 20
  
  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Grid background */}
      <div className="absolute inset-0 neural-grid opacity-40" />
      
      {/* Decorative gradient orbs */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(168, 24, 34, 0.3) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(244, 122, 32, 0.25) 0%, transparent 70%)'
        }}
      />
      
      {/* Animated nodes - represent neural network connections */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity }}
      >
        <defs>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7A0E17" />
            <stop offset="50%" stopColor="#A81822" />
            <stop offset="100%" stopColor="#F47A20" />
          </linearGradient>
        </defs>
        
        {/* Connection lines - static for performance */}
        {variant === 'prominent' && (
          <g stroke="url(#nodeGradient)" strokeWidth="1" opacity="0.2">
            <line x1="15%" y1="20%" x2="35%" y2="45%" />
            <line x1="35%" y1="45%" x2="55%" y2="30%" />
            <line x1="55%" y1="30%" x2="75%" y2="50%" />
            <line x1="75%" y1="50%" x2="85%" y2="70%" />
            <line x1="35%" y1="45%" x2="45%" y2="75%" />
            <line x1="15%" y1="20%" x2="25%" y2="80%" />
          </g>
        )}
        
        {/* Network nodes */}
        {Array.from({ length: nodeCount }).map((_, i) => {
          const x = 10 + (i * 80 / nodeCount) + (Math.sin(i) * 15)
          const y = 20 + (i % 3) * 30 + (Math.cos(i) * 10)
          const delay = i * 0.15
          
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={variant === 'subtle' ? '2' : '3'}
              fill="url(#nodeGradient)"
              opacity="0.4"
            >
              <animate
                attributeName="opacity"
                values="0.2;0.6;0.2"
                dur="4s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * Simplified neural network decoration for smaller spaces
 */
export function NeuralDecoration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full opacity-30"
      >
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7A0E17" />
            <stop offset="100%" stopColor="#F47A20" />
          </linearGradient>
        </defs>
        
        {/* Simplified connection pattern */}
        <g stroke="url(#neuralGradient)" strokeWidth="1.5" fill="none">
          <line x1="20" y1="30" x2="50" y2="60" />
          <line x1="50" y1="60" x2="80" y2="45" />
          <line x1="50" y1="60" x2="70" y2="90" />
        </g>
        
        {/* Key nodes */}
        <circle cx="20" cy="30" r="4" fill="url(#neuralGradient)" opacity="0.6" />
        <circle cx="50" cy="60" r="5" fill="url(#neuralGradient)" opacity="0.8" />
        <circle cx="80" cy="45" r="4" fill="url(#neuralGradient)" opacity="0.6" />
        <circle cx="70" cy="90" r="4" fill="url(#neuralGradient)" opacity="0.6" />
      </svg>
    </div>
  )
}
