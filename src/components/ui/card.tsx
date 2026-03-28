import * as React from 'react'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className ?? 'rounded-xl border bg-white shadow-sm'}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className ?? 'p-6 pt-0'} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardContent }
