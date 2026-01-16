"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnalytics } from "@/hooks/use-analytics";

export function FirebaseDemo() {
  const { trackEvent } = useAnalytics();

  const handleTestEvent = () => {
    trackEvent("test_event", {
      event_category: "demo",
      event_label: "firebase_integration",
      value: 1,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Analytics</CardTitle>
        <CardDescription>Demo Firebase Analytics integration</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleTestEvent}>Track Test Event</Button>
        <p className="text-sm text-muted-foreground mt-4">
          Click button to send test event to Firebase Analytics. Check Firebase
          Console to see the event.
        </p>
      </CardContent>
    </Card>
  );
}
