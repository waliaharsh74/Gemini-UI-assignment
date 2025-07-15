"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChatStore } from "@/lib/stores/chat-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Send, Copy, Paperclip } from "lucide-react"
import { generateAIResponse } from "@/lib/utils/ai-simulation"
import { formatDistanceToNow } from "date-fns"
import { ThemeToggle } from "@/components/theme-toggle"

interface ChatInterfaceProps {
  chatId: string
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { chatrooms, messages, isTyping, addMessage, setTyping, loadMoreMessages } = useChatStore()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const currentChatroom = chatrooms.find((room) => room.id === chatId)
  const currentMessages = messages[chatId] || []

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, isTyping])

  useEffect(() => {
    if (!currentChatroom) {
      router.push("/")
    }
  }, [currentChatroom, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleLoadMore = async () => {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    const scrollHeight = messagesContainerRef.current?.scrollHeight || 0

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate loading
    loadMoreMessages(chatId)

    // Maintain scroll position
    setTimeout(() => {
      if (messagesContainerRef.current) {
        const newScrollHeight = messagesContainerRef.current.scrollHeight
        messagesContainerRef.current.scrollTop = newScrollHeight - scrollHeight
      }
      setIsLoadingMore(false)
    }, 100)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return

    const messageContent = inputMessage.trim()
    const imageUrl = imagePreview

    // Add user message
    addMessage(chatId, {
      content: messageContent || "Shared an image",
      role: "user",
      imageUrl: imageUrl || undefined,
    })

    // Clear input
    setInputMessage("")
    removeImage()

    // Show typing indicator
    setTyping(true)

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(messageContent)

      // Add AI message
      addMessage(chatId, {
        content: aiResponse,
        role: "assistant",
      })

      toast({
        title: "Message sent",
        description: "Gemini has responded to your message.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTyping(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Message copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message.",
        variant: "destructive",
      })
    }
  }

  if (!currentChatroom) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold">{currentChatroom.title}</h1>
            <p className="text-sm text-muted-foreground">{isTyping ? "Gemini is typing..." : "AI Assistant"}</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load More Button */}
        {currentMessages.length > 0 && (
          <div className="text-center">
            <Button variant="ghost" onClick={handleLoadMore} disabled={isLoadingMore} className="text-sm">
              {isLoadingMore ? "Loading..." : "Load older messages"}
            </Button>
          </div>
        )}

        {/* Welcome Message */}
        {currentMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white font-bold">G</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Hello, {user?.name}!</h2>
            <p className="text-muted-foreground">I'm Gemini, your AI assistant. How can I help you today?</p>
          </div>
        )}

        {/* Messages */}
        {currentMessages.map((message) => (
          <div key={message.id} className={`flex gap-3 group ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback
                className={message.role === "user" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}
              >
                {message.role === "user" ? user?.name?.[0] || "U" : "G"}
              </AvatarFallback>
            </Avatar>

            <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
              <Card className={`p-3 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-muted"}`}>
                {message.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={message.imageUrl || "/placeholder.svg"}
                      alt="Shared image"
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20">
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-purple-500 text-white">G</AvatarFallback>
            </Avatar>
            <Card className="p-3 bg-muted">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-w-32 h-auto rounded-lg border" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={removeImage}
            >
              ×
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="w-4 h-4" />
          </Button>

          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Gemini..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-1"
          />

          <Button onClick={handleSendMessage} disabled={!inputMessage.trim() && !selectedImage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
