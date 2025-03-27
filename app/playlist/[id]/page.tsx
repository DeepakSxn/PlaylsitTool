"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Lock, Play, CheckCircle, ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { auth, db } from "@/firebase";
import { ThemeToggle } from "@/app/theme-toggle";

interface Video {
  id: string;
  title: string;
  duration?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  description?: string;
  publicId?: string;
  tags?: string[];
  category?: string;
}

export default function PlaylistPage() {
  const router = useRouter();
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<{ videos: Video[]; unlocked: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStartTime, setVideoStartTime] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Helper function to log analytics events
  const logEvent = async (eventType: string, watchDuration: number = 0) => {
    if (!auth.currentUser || !playlist) return;

    try {
      const userId = auth.currentUser.uid;
      const userEmail = auth.currentUser.email;
      const currentVideo = playlist.videos[currentVideoIndex];

      await addDoc(collection(db, "videoWatchEvents"), {
        eventType,
        videoId: currentVideo.id,
        videoTitle: currentVideo.title,
        userId,
        userEmail,
        watchedAt: new Date(),
        watchDuration,
      });
    } catch (error) {
      console.error("Error logging event:", error);
    }
  };

  // Fetch playlist ID based on authenticated user's playlist reference
  useEffect(() => {
    const fetchPlaylistId = async () => {
      try {
        const userId = auth.currentUser?.uid;

        if (!userId) {
          toast({
            title: "Error",
            description: "User not authenticated",
            variant: "destructive",
          });
          router.push("/playlistlog");
          return;
        }

        const playlistAQuery = query(
          collection(db, "playlistA"),
          where("userId", "==", userId)
        );
        const playlistADocs = await getDocs(playlistAQuery);

        if (!playlistADocs.empty) {
          const playlistADoc = playlistADocs.docs[0];
          const ref = playlistADoc.data().ref;
          setPlaylistId(ref);
        } else {
          toast({
            title: "Error",
            description: "No playlist found for user",
            variant: "destructive",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching playlist ID:", error);
        toast({
          title: "Error",
          description: "Failed to load playlist ID",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
    };

    fetchPlaylistId();
  }, [router]);

  // Fetch playlist data when playlistId is available
  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!playlistId) return;

      try {
        const docRef = doc(db, "playlists", playlistId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPlaylist({
            videos: data.videos || [],
            unlocked: data.unlocked || 1,
          });
        } else {
          toast({
            title: "Error",
            description: "Playlist not found",
            variant: "destructive",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast({
          title: "Error",
          description: "Failed to load playlist",
          variant: "destructive",
        });
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId, router]);

  // Prevent keyboard shortcuts for video control
  useEffect(() => {
    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      if ([" ", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", preventKeyboardShortcuts);
    return () => window.removeEventListener("keydown", preventKeyboardShortcuts);
  }, []);

  // Handle video time update
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    setProgress((video.currentTime / video.duration) * 100);

    if (Math.abs(video.currentTime - videoStartTime) > 1) {
      video.currentTime = videoStartTime;
    } else {
      setVideoStartTime(video.currentTime);
    }
  };

  // Handle video play
  const handleVideoPlay = () => {
    if (!videoRef.current) return;
    setVideoStartTime(videoRef.current.currentTime);

    // Log play event
    logEvent("play");
  };

  // Handle video end
  const handleVideoEnd = async () => {
    if (!videoRef.current || !playlist || currentVideoIndex >= playlist.videos.length - 1) return;

    const video = videoRef.current;
    const watchDuration = Math.max(video.currentTime - videoStartTime, 0); // Ensure non-negative duration

    try {
      // Log watch duration event
      await logEvent("watchDuration", watchDuration);

      // Unlock next video logic
      const newUnlocked = Math.min(currentVideoIndex + 2, playlist.videos.length);
      await updateDoc(doc(db, "playlists", playlistId!), { unlocked: newUnlocked });

      setPlaylist((prev) =>
        prev ? { ...prev, unlocked: newUnlocked } : null
      );

      toast({
        title: "Video Completed! 🎉",
        description: "Next video has been unlocked.",
        duration: 3000,
      });

      setTimeout(() => {
        setCurrentVideoIndex(currentVideoIndex + 1);
      }, 1000);
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast({
        title: "Error",
        description: "Failed to unlock next video",
        variant: "destructive",
      });
    }
  };

  // Switch to a specific video in the playlist
  const switchVideo = (index: number) => {
    if (!playlist || index >= playlist.unlocked) return;
    setCurrentVideoIndex(index);
    setProgress(0);
    setVideoStartTime(0);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  if (!playlist) return null;

  const currentVideo = playlist.videos[currentVideoIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold flex-1">Your Playlist</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 px-4">
        {/* Video Player */}
        {currentVideo && (
          <div className="mb-8">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                src={currentVideo.videoUrl}
                className="w-full h-full"
                controls
                onPlay={handleVideoPlay}
                onEnded={handleVideoEnd}
                onTimeUpdate={handleVideoTimeUpdate}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <h2 className="text-2xl font-semibold">{currentVideo.title}</h2>
            {currentVideo.description && (
              <p className="text-muted-foreground mt-2">{currentVideo.description}</p>
            )}
          </div>
        )}

        {/* Playlist Videos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Videos in Playlist</h2>
          <div className="grid gap-4">
            {playlist.videos.map((video, index) => (
              <Card key={video.id} onClick={() => switchVideo(index)}>
                <CardContent>{video.title}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
