type TikTokQueue = {
  track?: (eventName: string, properties?: Record<string, unknown>) => void;
};

export const trackTikTokEvent = (
  eventName: string,
  properties?: Record<string, unknown>,
) => {
  if (typeof window !== "undefined") {
    const ttq = (window as unknown as { ttq?: TikTokQueue }).ttq;
    ttq?.track?.(eventName, properties);
  }
};
