"use client"

import { useParams } from "next/navigation"
import ChatInterface from "@/components/chat/chat-interface"

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string

  return <ChatInterface chatId={chatId} />
}
