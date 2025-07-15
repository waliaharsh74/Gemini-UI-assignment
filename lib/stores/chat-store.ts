import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  imageUrl?: string
}

export interface Chatroom {
  id: string
  title: string
  createdAt: Date
  lastMessage?: string
  lastMessageTime?: Date
}

interface ChatState {
  chatrooms: Chatroom[]
  messages: Record<string, Message[]>
  isTyping: boolean
  createChatroom: (title: string) => string
  deleteChatroom: (id: string) => void
  addMessage: (chatroomId: string, message: Omit<Message, "id" | "timestamp">) => void
  setTyping: (typing: boolean) => void
  loadMoreMessages: (chatroomId: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatrooms: [],
      messages: {},
      isTyping: false,
      createChatroom: (title: string) => {
        const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newChatroom: Chatroom = {
          id,
          title,
          createdAt: new Date(),
        }
        set((state) => ({
          chatrooms: [newChatroom, ...state.chatrooms],
          messages: { ...state.messages, [id]: [] },
        }))
        return id
      },
      deleteChatroom: (id: string) => {
        set((state) => {
          const newMessages = { ...state.messages }
          delete newMessages[id]
          return {
            chatrooms: state.chatrooms.filter((room) => room.id !== id),
            messages: newMessages,
          }
        })
      },
      addMessage: (chatroomId: string, message: Omit<Message, "id" | "timestamp">) => {
        const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        }

        set((state) => {
          const updatedMessages = {
            ...state.messages,
            [chatroomId]: [...(state.messages[chatroomId] || []), newMessage],
          }

          const updatedChatrooms = state.chatrooms.map((room) =>
            room.id === chatroomId
              ? {
                  ...room,
                  lastMessage: message.content.substring(0, 50) + (message.content.length > 50 ? "..." : ""),
                  lastMessageTime: new Date(),
                }
              : room,
          )

          return {
            messages: updatedMessages,
            chatrooms: updatedChatrooms,
          }
        })
      },
      setTyping: (typing: boolean) => set({ isTyping: typing }),
      loadMoreMessages: (chatroomId: string) => {
        // Simulate loading older messages
        const dummyMessages: Message[] = Array.from({ length: 10 }, (_, i) => ({
          id: `old_msg_${Date.now()}_${i}`,
          content: `This is an older message ${i + 1}`,
          role: Math.random() > 0.5 ? "user" : "assistant",
          timestamp: new Date(Date.now() - (i + 1) * 60000 * 60), // Hours ago
        }))

        set((state) => ({
          messages: {
            ...state.messages,
            [chatroomId]: [...dummyMessages, ...(state.messages[chatroomId] || [])],
          },
        }))
      },
    }),
    {
      name: "chat-storage",
    },
  ),
)
