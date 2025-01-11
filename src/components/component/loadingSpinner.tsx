import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ size = 'md', className, ...props }: LoadingSpinnerProps) {
  const sizeClass = {
    'sm': 'w-5 h-5',
    'md': 'w-8 h-8',
    'lg': 'w-12 h-12'
  }[size]

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex items-center justify-center gap-3", className)}
      {...props}
    >
      <svg
        className={cn("animate-spin text-muted-foreground", sizeClass)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-muted-foreground font-medium">Loading...</span>
    </div>
  )
}