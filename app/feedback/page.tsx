"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, SendHorizonal, Loader2 } from "lucide-react";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recommendation.trim()) {
      toast({
        title: "Recommendation Required",
        description: "Please share your suggestions before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "recommendations"), {
        userId: user?.uid,
        userEmail: user?.email,
        recommendation,
        type: "playlist_creation",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Thank You! ✨",
        description: "Your suggestions will help us improve our content.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting recommendation:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your suggestions. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Share Your Recommendations</h1>
          </div>
          
          <p className="text-muted-foreground">
            Thank you for creating your playlist! Help us improve by suggesting what kind of videos 
            and topics you'd like to see in future playlists.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="recommendation" className="text-sm font-medium">
                What topics or content would you like to see in future playlists?
              </label>
              <Textarea
                id="recommendation"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                rows={6}
                placeholder="Share your suggestions for video topics, specific content you'd like to learn about, or any ideas for improving future playlists..."
                disabled={submitting}
                className="resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <SendHorizonal className="mr-2 h-4 w-4" />
                  Submit Recommendations
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}