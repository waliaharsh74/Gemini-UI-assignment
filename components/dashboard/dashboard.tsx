"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useChatStore } from "@/lib/stores/chat-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Trash2, MessageSquare, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useDebounce } from "@/hooks/use-debounce"
import { formatDistanceToNow } from "date-fns"

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newChatroomTitle, setNewChatroomTitle] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { chatrooms, createChatroom, deleteChatroom } = useChatStore()
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filteredChatrooms = useMemo(() => {
    if (!debouncedSearchQuery) return chatrooms
    return chatrooms.filter((room) => room.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  }, [chatrooms, debouncedSearchQuery])

  const handleCreateChatroom = () => {
    if (!newChatroomTitle.trim()) return

    const chatroomId = createChatroom(newChatroomTitle.trim())
    setNewChatroomTitle("")
    setIsCreateDialogOpen(false)

    toast({
      title: "Chatroom Created",
      description: `"${newChatroomTitle}" has been created successfully.`,
    })

    router.push(`/chat/${chatroomId}`)
  }

  const handleDeleteChatroom = (id: string, title: string) => {
    deleteChatroom(id)
    toast({
      title: "Chatroom Deleted",
      description: `"${title}" has been deleted.`,
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gemini Chat
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search chatrooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chatroom</DialogTitle>
                <DialogDescription>Give your new chatroom a descriptive title.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="title">Chatroom Title</Label>
                <Input
                  id="title"
                  placeholder="Enter chatroom title..."
                  value={newChatroomTitle}
                  onChange={(e) => setNewChatroomTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateChatroom()
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChatroom} disabled={!newChatroomTitle.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chatrooms Grid */}
        {filteredChatrooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No chatrooms found" : "No chatrooms yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first chatroom to start chatting with Gemini"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Chat
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatrooms.map((chatroom) => (
              <Card key={chatroom.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{chatroom.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Created {formatDistanceToNow(new Date(chatroom.createdAt), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteChatroom(chatroom.id, chatroom.title)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0" onClick={() => router.push(`/chat/${chatroom.id}`)}>
                  {chatroom.lastMessage ? (
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{chatroom.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chatroom.lastMessageTime!), { addSuffix: true })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No messages yet - start the conversation!</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
