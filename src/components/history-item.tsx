import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  FileCode,
  AlertCircle,
  Copy
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type ErrorContext = {
  errorType: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  stackTrace?: string[];
}

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  errorContext?: ErrorContext;
}

interface HistoryItemProps {
  conversation: Conversation;
}

export default function HistoryItem({ conversation }: HistoryItemProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleContinue = () => {
    router.push(`/chat?id=${conversation.id}`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatFilePath = (path: string) => {
    const parts = path.split('/')
    return parts.length > 2 
      ? `.../${parts.slice(-2).join('/')}`
      : path
  }

  return (
    <Card className="group hover:scale-[1.01] transition-all duration-200 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h3 className="text-xl font-medium text-gray-900">{conversation.title}</h3>
              {conversation.errorContext && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-2 -top-2 text-[10px] px-1.5 py-0.5 bg-red-500/90 text-white"
                >
                  Error
                </Badge>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500 font-medium">{conversation.timestamp}</span>
        </div>

        {conversation.errorContext ? (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600/90">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                {conversation.errorContext.errorType}
              </span>
            </div>

            {conversation.errorContext.filePath && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <FileCode className="h-4 w-4 text-gray-400" />
                <span className="font-mono">
                  {formatFilePath(conversation.errorContext.filePath)}
                  {conversation.errorContext.lineNumber && 
                    `:${conversation.errorContext.lineNumber}`}
                  {conversation.errorContext.columnNumber && 
                    `:${conversation.errorContext.columnNumber}`}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-auto h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    if (conversation.errorContext?.filePath) {
                      copyToClipboard(conversation.errorContext.filePath)
                    }
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {conversation.errorContext.stackTrace && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  Stack Trace
                </Button>

                {isExpanded && (
                  <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm">
                    {conversation.errorContext.stackTrace.map((line, index) => (
                      <div 
                        key={index}
                        className="group/line hover:bg-gray-100 rounded-md px-3 py-2 flex items-center justify-between transition-colors"
                      >
                        <span className="text-gray-600">{line}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover/line:opacity-100 transition-opacity h-7 px-2"
                          onClick={() => copyToClipboard(line)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 mb-6 line-clamp-2">
            {conversation.lastMessage}
          </p>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Button 
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => router.push(`/chat/review/${conversation.id}`)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Review
          </Button>
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

