"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/firebase/config";
import { logEvent } from "firebase/analytics";

export function useAnalytics() {
  const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
    if (analytics) {
      // Use type assertion for custom event names
      logEvent(analytics, eventName as never, eventParams);
    }
  };

  return { trackEvent, analytics };
}

// Hook to track page views
export function usePageView(pageName: string) {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent("page_view", {
      page_title: pageName,
      page_location: window.location.href,
    });
  }, [pageName, trackEvent]);
}

