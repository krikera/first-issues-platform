"use client";

/**
 * State-of-the-art Error Boundary component with comprehensive error handling
 * Provides fallback UI, error logging, and user-friendly error messages
 */

import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Component, ErrorInfo, ReactNode, FC, useCallback } from "react"

import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  level?: "page" | "component" | "critical"
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private readonly maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorId,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log error details for debugging
    const errorDetails = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      errorId: this.state.errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      level: this.props.level || "component",
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 React Error Boundary")
      console.error("Error:", error)
      console.error("Error Info:", errorInfo)
      console.error("Full Details:", errorDetails)
      console.groupEnd()
    }

    // Report error to external service in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(errorDetails)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  private reportError = async (errorDetails: any) => {
    try {
      // Send error to monitoring service (Sentry, LogRocket, etc.)
      // This would be replaced with actual error reporting service
      if (typeof window !== "undefined" && "fetch" in window) {
        await fetch("/api/errors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(errorDetails),
        }).catch(() => {
          // Silently fail if error reporting fails
          console.warn("Failed to report error to monitoring service")
        })
      }
    } catch {
      // Prevent error boundary from crashing due to error reporting
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      })
    } else {
      // Max retries reached, suggest page reload
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    window.location.href = "/"
  }

  private getErrorMessage = (): string => {
    const { error } = this.state
    const { level } = this.props

    if (!error) {
      return "An unexpected error occurred"
    }

    // Provide user-friendly messages based on error type
    if (
      error.message.includes("ChunkLoadError") ||
      error.message.includes("Loading chunk")
    ) {
      return "The application failed to load. This might be due to a network issue or an update. Please try refreshing the page."
    }

    if (
      error.message.includes("Network Error") ||
      error.message.includes("fetch")
    ) {
      return "Unable to connect to the server. Please check your internet connection and try again."
    }

    if (level === "critical") {
      return "A critical error has occurred. The application needs to be restarted."
    }

    if (level === "page") {
      return "This page encountered an error. You can try reloading or go back to the home page."
    }

    return "Something went wrong with this component. You can try again or continue using the rest of the application."
  }

  private renderErrorUI = () => {
    const { level = "component" } = this.props
    const { error, errorId } = this.state
    const errorMessage = this.getErrorMessage()
    const canRetry = this.retryCount < this.maxRetries

    // Custom fallback UI for different error levels
    const baseClasses =
      "flex flex-col items-center justify-center p-6 text-center space-y-4"
    const levelClasses = {
      critical: "min-h-screen bg-destructive/5 border-2 border-destructive",
      page: "min-h-[60vh] bg-muted/50 border border-border rounded-lg",
      component: "min-h-[200px] bg-muted/30 border border-border/50 rounded-md",
    }

    return (
      <div className={`${baseClasses} ${levelClasses[level]}`}>
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle size={level === "critical" ? 48 : 32} />
          <h2
            className={`font-semibold ${level === "critical" ? "text-2xl" : "text-lg"}`}
          >
            {level === "critical" ? "Critical Error" : "Something went wrong"}
          </h2>
        </div>

        <p className="text-muted-foreground max-w-md">{errorMessage}</p>

        {process.env.NODE_ENV === "development" && error ? (
          <details className="mt-4 p-3 bg-muted rounded text-sm text-left max-w-lg">
            <summary className="cursor-pointer font-medium">
              Technical Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {error.message}
              {error.stack ? `\n\nStack Trace:\n${error.stack}` : null}
            </pre>
          </details>
        ) : null}

        <div className="flex flex-wrap gap-3 justify-center">
          {canRetry ? (
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size={level === "critical" ? "lg" : "default"}
              className="flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Try Again ({this.maxRetries - this.retryCount} left)</span>
            </Button>
          ) : null}

          {(level === "page" || level === "critical") && (
            <Button
              onClick={this.handleGoHome}
              variant={level === "critical" ? "default" : "outline"}
              size={level === "critical" ? "lg" : "default"}
              className="flex items-center space-x-2"
            >
              <Home size={16} />
              <span>Go Home</span>
            </Button>
          )}

          {!canRetry && level === "component" && (
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="default"
              className="flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Reload Page</span>
            </Button>
          )}
        </div>

        {errorId ? (
          <p className="text-xs text-muted-foreground mt-4">
            Error ID: {errorId}
          </p>
        ) : null}
      </div>
    )
  }

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default error UI
      return this.props.fallback || this.renderErrorUI()
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Export specialized error boundaries for different use cases
export const PageErrorBoundary: FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="page">{children}</ErrorBoundary>

export const ComponentErrorBoundary: FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="component">{children}</ErrorBoundary>

export const CriticalErrorBoundary: FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="critical">{children}</ErrorBoundary>

// Hook for programmatic error reporting
export const useErrorReporting = () => {
  const reportError = useCallback((error: Error, context?: string) => {
    const errorDetails = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === "development") {
      console.error("Manual Error Report:", errorDetails)
    }

    // Report to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorDetails),
      }).catch(() => {
        console.warn("Failed to report error")
      })
    }
  }, [])

  return { reportError }
}
