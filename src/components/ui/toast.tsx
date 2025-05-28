import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

function Toast({ message, type = 'info', isVisible, onClose, duration = 5000 }: ToastProps) {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800", 
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }

  const iconMap = {
    success: "✓",
    error: "✕", 
    warning: "⚠",
    info: "ℹ"
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm",
        typeStyles[type]
      )}>
        <span className="text-lg">{iconMap[type]}</span>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Hook for managing toast state
function useToast() {
  const [toast, setToast] = React.useState<{
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false
  })

  const showToast = React.useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type, isVisible: true })
  }, [])

  const hideToast = React.useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  return {
    toast,
    showToast,
    hideToast
  }
}

export { Toast, useToast }