'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import type { Channel } from 'pusher-js';

export function usePusher(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusherChannel = pusherClient.subscribe(channelName);
    setChannel(pusherChannel);

    return () => {
      pusherChannel.unsubscribe();
    };
  }, [channelName]);

  return channel;
}

export function usePusherEvent<T>(
  channelName: string,
  eventName: string,
  callback: (data: T) => void
) {
  const channel = usePusher(channelName);

  useEffect(() => {
    if (!channel) return;

    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
    };
  }, [channel, eventName, callback]);
}