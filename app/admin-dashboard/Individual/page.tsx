"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Clock, User } from "lucide-react"

export default function VideoAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("videos")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [dateRange, setDateRange] = useState("all")

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Fetch watch events
      const eventsQuery = query(collection(db, "videoWatchEvents"), orderBy("watchedAt", "desc"))
      const eventsSnapshot = await getDocs(eventsQuery)

      // Simple processing of data
      const videoMap = new Map()
      const userMap = new Map()

      eventsSnapshot.docs.forEach((doc) => {
        const data = doc.data()

        // Process video data
        if (!videoMap.has(data.videoId)) {
          videoMap.set(data.videoId, {
            id: data.videoId,
            title: data.videoTitle || "Unknown Video",
            views: 0,
            uniqueUsers: new Set(),
            watchTime: 0,
          })
        }

        const videoData = videoMap.get(data.videoId)
        if (data.eventType === "play") {
          videoData.views++
        }
        videoData.uniqueUsers.add(data.userId)
        videoData.watchTime += data.watchDuration || 0

        // Process user data
        if (!userMap.has(data.userId)) {
          userMap.set(data.userId, {
            id: data.userId,
            email: data.userEmail || "Unknown User",
            watchTime: 0,
            videos: new Set(),
          })
        }

        const userData = userMap.get(data.userId)
        userData.watchTime += data.watchDuration || 0
        userData.videos.add(data.videoId)
      })

      // Convert maps to arrays with computed properties
      const videosArray = Array.from(videoMap.values()).map((video) => ({
        ...video,
        uniqueUsers: video.uniqueUsers.size,
        avgWatchTime: video.views > 0 ? video.watchTime / video.views : 0,
      }))

      const usersArray = Array.from(userMap.values()).map((user) => ({
        ...user,
        videoCount: user.videos.size,
        videos: Array.from(user.videos),
      }))

      setVideos(videosArray)
      setUsers(usersArray)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter videos and users based on search term
  const filteredVideos = videos.filter((video) => video.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Individual Analytics</h1>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for users or videos..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <Tabs defaultValue="videos" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="videos">Individual Videos</TabsTrigger>
          <TabsTrigger value="users">Individual Users</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Performance</CardTitle>
              <CardDescription>Detailed analytics for individual videos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-muted/50 font-medium">
                    <div className="col-span-1">Video Title</div>
                    <div className="col-span-1 text-center">Views</div>
                    <div className="col-span-1 text-center">Unique Users</div>
                    <div className="col-span-1 text-center">Avg. Watch Time</div>
                  </div>
                  {filteredVideos.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      {searchTerm ? `No videos found matching "${searchTerm}"` : "No video data available"}
                    </div>
                  ) : (
                    filteredVideos.map((video) => (
                      <div key={video.id} className="grid grid-cols-4 gap-4 px-4 py-4 border-t hover:bg-muted/50">
                        <div className="col-span-1 font-medium truncate">{video.title}</div>
                        <div className="col-span-1 text-center">{video.views}</div>
                        <div className="col-span-1 text-center">{video.uniqueUsers}</div>
                        <div className="col-span-1 text-center">{formatTime(video.avgWatchTime)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed information about individual user engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-muted/50 font-medium">
                    <div className="col-span-1">User</div>
                    <div className="col-span-1 text-center">Videos Watched</div>
                    <div className="col-span-1 text-center">Total Watch Time</div>
                  </div>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      {searchTerm ? `No users found matching "${searchTerm}"` : "No user data available"}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="grid grid-cols-3 gap-4 px-4 py-4 border-t hover:bg-muted/50">
                        <div className="col-span-1 font-medium truncate flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.email}
                        </div>
                        <div className="col-span-1 text-center">
                          <div className="flex items-center justify-center">
                            <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                            {user.videoCount}
                          </div>
                        </div>
                        <div className="col-span-1 text-center">
                          <div className="flex items-center justify-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatTime(user.watchTime)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

