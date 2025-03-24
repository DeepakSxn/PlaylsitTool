"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut, Search, Save, X, Filter, Play, Eye, CheckCircle } from "lucide-react";
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchVideos } from "@/lib/cloudinary";
import { sendPlaylistEmail } from "@/lib/email";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { PlayCircle, SortAsc } from "lucide-react";

interface Video {
  id: string;
  title: string;
  duration?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  description?: string;
  publicId?: string;
  tags?: string[];
  category?: string;
  createdAt?: string;
  views?: number;
  watchTime?: number;
  engagement?: number;
}

// Add animation variants before the VideoCard component
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const VideoCard = ({ 
  video, 
  isSelected, 
  onSelect,
  onViewDetails 
}: { 
  video: Video; 
  isSelected: boolean; 
  onSelect: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format the video title or use a fallback
  const displayTitle = video.title || "Untitled Video";
  
  // Format the video ID for display if needed
  const formattedId = video.publicId 
    ? video.publicId.substring(0, 10) + (video.publicId.length > 10 ? '...' : '') 
    : 'No ID';

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsVideoLoaded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  return (
    <Card
      className={`group relative cursor-pointer transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-800 ${
        isSelected ? "ring-2 ring-primary shadow-md" : "hover:border-primary/50"
      }`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
          {/* Thumbnail Image */}
          <Image
            src={video.publicId ? `https://res.cloudinary.com/dvuf7bf0x/video/upload/${video.publicId}.jpg` : "/placeholder.svg"}
            alt={displayTitle}
            width={320}
            height={180}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isHovered && isVideoLoaded ? "opacity-0" : "opacity-100"
            }`}
            priority
          />
          
          {/* Video Preview */}
          {isHovered && video.publicId && (
            <video
              ref={videoRef}
              src={`https://res.cloudinary.com/dvuf7bf0x/video/upload/e_preview:duration_8/${video.publicId}.mp4`}
              autoPlay
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isVideoLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadedData={() => setIsVideoLoaded(true)}
              onError={() => setIsVideoLoaded(false)}
            />
          )}

          {/* Loading Indicator */}
          {isHovered && !isVideoLoaded && video.publicId && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* View Details Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {video.duration}
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1 shadow-md">
            ✔
          </div>
        )}

        {/* Category Badge */}
        {video.category && !isSelected && (
          <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {video.category}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-2">{displayTitle}</h3>
        {/* Add a descriptive subtitle if video lacks proper title */}
        {!video.title && video.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {video.description.substring(0, 50)}...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<"title" | "duration" | null>(null);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedVideoForDetails, setSelectedVideoForDetails] = useState<Video | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdPlaylistId, setCreatedPlaylistId] = useState<string | null>(null);
  const [playlistInfo, setPlaylistInfo] = useState<{
    videoCount: number;
    playlistUrl: string;
  } | null>(null);

  const categories = useMemo(() => 
    ["all", ...new Set(videos.map(video => video.category || "").filter(Boolean))], 
    [videos]
  );

  const allTags = useMemo(() => 
    Array.from(new Set(videos.flatMap(video => video.tags || []))).sort(),
    [videos]
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    });

    loadVideos();
    return () => unsubscribe();
  }, [router]);

    const loadVideos = async () => {
      try {
        setIsLoading(true);
        const videoData = await fetchVideos();
      
      const processedVideoData = videoData.map((video) => {
        // Get the raw data and type it properly
        const data = video as unknown as {
          id: string;
          title?: string;
          description?: string;
          category?: string;
          duration?: string;
          publicId?: string;
          thumbnailUrl?: string;
          videoUrl?: string;
          tags?: string[];
          createdAt?: string;
        };

        // Create a properly typed Video object with default values
        const processedVideo: Video = {
          id: data.id,
          title: data.title || `Video ${data.id.substring(0, 6)}`,
          description: data.description || '',
          category: data.category || '',
          duration: data.duration || '',
          publicId: data.publicId || '',
          thumbnailUrl: data.thumbnailUrl || '',
          videoUrl: data.videoUrl || '',
          tags: data.tags || [],
          createdAt: data.createdAt || new Date().toISOString()
        };

        // Override title if it looks like a hash
        if (!processedVideo.title || processedVideo.title.match(/^[a-z0-9]{15,}$/i)) {
          processedVideo.title = processedVideo.description 
            ? `Video: ${processedVideo.description.substring(0, 30)}${processedVideo.description.length > 30 ? '...' : ''}` 
            : processedVideo.category 
              ? `${processedVideo.category} Video #${processedVideo.id.substring(0, 5)}` 
              : `Video #${processedVideo.id.substring(0, 8)}`;
        }
        
        // Ensure thumbnail URL is set if we have a publicId
        if (processedVideo.publicId && !processedVideo.thumbnailUrl) {
          processedVideo.thumbnailUrl = `https://res.cloudinary.com/dvuf7bf0x/video/upload/${processedVideo.publicId}.jpg`;
        }
        
        return processedVideo;
      });
      
      setVideos(processedVideoData);
      setFilteredVideos(processedVideoData);
      } catch (error) {
      console.error("Error fetching videos:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load videos. Please try again later.", 
        variant: "destructive" 
      });
      } finally {
        setIsLoading(false);
      }
    };

  const filterVideos = useCallback(() => {
    let result = [...videos];
    const lowerCaseQuery = searchTerm.toLowerCase();

    if (searchTerm) {
      result = result.filter(video => 
        video.title.toLowerCase().includes(lowerCaseQuery) ||
        (video.description && video.description.toLowerCase().includes(lowerCaseQuery)) ||
        video.tags?.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
      );
    }

    if (activeTab !== "all") {
      result = result.filter(video => video.category === activeTab);
    }

    if (tagFilter !== "all") {
      result = result.filter(video => video.tags?.includes(tagFilter));
    }

    if (sortBy) {
      result.sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "duration") {
          const parseDuration = (duration: string | undefined): number => {
            if (!duration) return 0;
            return duration.split(':').reduce((acc, time) => (60 * acc) + parseInt(time, 10), 0);
          };
          return parseDuration(a.duration) - parseDuration(b.duration);
        }
        return 0;
      });
    }

    return result;
  }, [searchTerm, activeTab, videos, sortBy, tagFilter]);

  useEffect(() => {
    setFilteredVideos(filterVideos());
  }, [filterVideos]);

  const toggleVideoSelection = useCallback((videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Logout Failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (selectedVideos.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one video.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email) {
      toast({ 
        title: "Authentication Error", 
        description: "Please log in again to create a playlist", 
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedVideoData = videos
        .filter(video => selectedVideos.includes(video.id))
        .map(video => ({
          id: video.id,
          title: video.title || 'Untitled Video',
          description: video.description || '',
          category: video.category || '',
          videoUrl: video.publicId 
            ? `https://res.cloudinary.com/dvuf7bf0x/video/upload/${video.publicId}.mp4`
            : '',
          thumbnailUrl: video.publicId 
            ? `https://res.cloudinary.com/dvuf7bf0x/video/upload/${video.publicId}.jpg`
            : '',
          duration: video.duration || '',
          publicId: video.publicId || ''
        }));
      
      // Create playlist document
      const playlistRef = await addDoc(collection(db, "playlists"), {
        userId: user?.uid || "",
        userEmail: user?.email || "",
        createdAt: serverTimestamp(),
        videos: selectedVideoData,
        unlocked: 1
      });

      // Generate playlist URL
      const playlistUrl = `${window.location.origin}/playlist/${playlistRef.id}`;

      // Send email
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user?.email,
          subject: 'Your Video Playlist is Ready!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Your Video Playlist is Ready! 🎉</h2>
              <p>Your playlist has been created successfully. Click the button below to start watching:</p>
              <a href="${playlistUrl}" 
                 style="display: inline-block; background-color: #0070f3; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                        margin: 20px 0;">
                View Your Playlist
              </a>
              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color: #0070f3;">${playlistUrl}</span>
              </p>
            </div>
          `
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailResult.error || 'Failed to send email');
      }

      // Store playlist info for success dialog
      setCreatedPlaylistId(playlistRef.id);
      setPlaylistInfo({
        videoCount: selectedVideoData.length,
        playlistUrl: playlistUrl
      });
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // Show toast notification
      toast({
        title: "Playlist Created! 🎉",
        description: "The playlist link has been sent to your email.",
        duration: 2000,
      });

      // Clear selection
      setSelectedVideos([]);

      // Redirect to feedback page after 2 seconds
      setTimeout(() => {
        router.push(`/feedback?playlistId=${playlistRef.id}`);
      }, 2000);

    } catch (error: any) {
      console.error("Error:", error);
      
      // Show appropriate error message
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create playlist. Please try again.", 
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (video: Video) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video selection when clicking details button
    setSelectedVideoForDetails(video);
    setShowDetailsDialog(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-[1400px] mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Video Dashboard</span>
          </Link>
          <nav className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">{user?.email}</span>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            <div className="relative flex-1 max-w-xl" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="pl-10 pr-10 w-full"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {isSearchFocused && searchTerm && (
                <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                  {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                      <div
                        key={video.id}
                        className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          toggleVideoSelection(video.id);
                          setSearchTerm("");
                          setIsSearchFocused(false);
                        }}
                      >
                        <Image
                          src={video.thumbnailUrl || (video.publicId ? `https://res.cloudinary.com/dvuf7bf0x/video/upload/${video.publicId}.jpg` : "/placeholder.svg")}
                          alt={video.title}
                          width={40}
                          height={24}
                          className="object-cover rounded"
                        />
                        <span className="text-sm truncate">{video.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-muted-foreground text-sm">No results found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 min-w-[120px]">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Sort By</label>
                      <Select value={sortBy || undefined} onValueChange={(value) => setSortBy(value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sorting" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Filter by Tag</label>
                      <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tags</SelectItem>
                          {allTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSortBy(null);
                        setTagFilter("all");
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleSubmit}
                disabled={submitting || !selectedVideos.length}
                className="min-w-[180px]"
              >
                {submitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Playlist ({selectedVideos.length})
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex w-auto border-b pb-px mb-4">
              {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category || "all"} 
                    className="capitalize px-4 py-2 whitespace-nowrap"
                  >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[16/10] rounded-lg" />
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No videos found</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredVideos.map((video) => (
                <motion.div key={video.id} variants={itemVariants}>
                  <VideoCard
                    video={video}
                    isSelected={selectedVideos.includes(video.id)}
                    onSelect={() => toggleVideoSelection(video.id)}
                    onViewDetails={(e) => handleViewDetails(video)(e)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container max-w-[1400px] mx-auto">
          © {new Date().getFullYear()} Video Dashboard. All rights reserved.
        </div>
      </footer>

      {/* Video Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Video Details</DialogTitle>
          </DialogHeader>
          {selectedVideoForDetails && (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={selectedVideoForDetails.publicId 
                    ? `https://res.cloudinary.com/dvuf7bf0x/video/upload/${selectedVideoForDetails.publicId}.jpg` 
                    : "/placeholder.svg"
                  }
                  alt={selectedVideoForDetails.title}
                  fill
                  className="object-cover"
                />
                
                {/* Add Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Title</h3>
                  <p>{selectedVideoForDetails.title}</p>
                </div>

                {selectedVideoForDetails.description && (
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-muted-foreground">{selectedVideoForDetails.description}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  {selectedVideoForDetails.category && (
                    <div>
                      <h3 className="font-semibold">Category</h3>
                      <Badge variant="secondary">{selectedVideoForDetails.category}</Badge>
                    </div>
                  )}

                  {selectedVideoForDetails.duration && (
                    <div>
                      <h3 className="font-semibold">Duration</h3>
                      <span className="text-muted-foreground">{selectedVideoForDetails.duration}</span>
                    </div>
                  )}
                </div>

                {selectedVideoForDetails.tags && selectedVideoForDetails.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedVideoForDetails.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add ID information for debugging */}
                <div>
                  <h3 className="font-semibold text-xs text-gray-500">Video ID</h3>
                  <p className="text-xs text-gray-500">{selectedVideoForDetails.id}</p>
                  {selectedVideoForDetails.publicId && (
                    <p className="text-xs text-gray-500">Public ID: {selectedVideoForDetails.publicId}</p>
                  )}
                </div>
              </div>

              {/* Add action buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    toggleVideoSelection(selectedVideoForDetails.id);
                    setShowDetailsDialog(false);
                  }}
                >
                  {selectedVideos.includes(selectedVideoForDetails.id) ? 'Remove from Playlist' : 'Add to Playlist'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Playlist Created Successfully!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-center">
                Your playlist with {playlistInfo?.videoCount || 0} videos has been created and sent to your email.
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Redirecting to feedback form in 2 seconds...</p>
              <p>You can check your email for the playlist link or access it directly from your dashboard later.</p>
            </div>
            
            <div className="flex justify-center">
              <AnimatePresence>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-1 bg-primary rounded-full"
                />
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}