'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/app-layout'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <AppLayout>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <Card className="w-full max-w-lg border-destructive bg-destructive/5">
                <CardHeader className="text-center">
                    <div className="mx-auto w-fit rounded-full bg-destructive/10 p-3">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-destructive mt-4">Something Went Wrong</CardTitle>
                    <CardDescription>
                        An unexpected error occurred. You can try to reload the page or return to the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-xs font-mono bg-background p-3 rounded-md overflow-x-auto">
                        <p className="font-semibold">Error Details:</p>
                        <p>{error.message}</p>
                    </div>
                    <Button
                        onClick={() => reset()}
                        className="w-full"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try again
                    </Button>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  )
}
