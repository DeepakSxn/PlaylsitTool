"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface PlaylistCreationSuccessProps {
  onClose: () => void;
}

const PlaylistCreationSuccess = ({ onClose }: PlaylistCreationSuccessProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Playlist Created Successfully! 🎉</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your playlist has been created and is ready to share.
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaylistCreationSuccess; 