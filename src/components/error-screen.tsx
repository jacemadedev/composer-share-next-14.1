interface ErrorScreenProps {
  message: string
}

export default function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">
        Error loading application: {message}
      </div>
    </div>
  )
} 