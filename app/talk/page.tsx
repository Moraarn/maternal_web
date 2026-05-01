import TalkClient from '../../components/talk/TalkClient'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

export default function TalkPage() {
  // Initialize with empty data - client components will handle authentication and data fetching
  const initialMessages: Message[] = [
    {
      id: '1',
      text: "Hello! I am the CystaNiva health assistant. Tell me how you are feeling today — you can speak or type in any language.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]

  const userContext = {
    status: 'unknown',
    trimester: 'first',
    weeksCount: 0,
    lastRiskLevel: 'low',
    lastSymptoms: [],
  }

  return (
    <TalkClient 
      initialMessages={initialMessages}
      userContext={userContext}
      user={null}
    />
  )
}
