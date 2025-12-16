'use client';

import { useEffect, useState } from 'react';
import { usePusherEvent } from '@/hooks/usePusher';
import { pusherClient } from '@/lib/pusher';

export default function TestPusherPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [mounted, setMounted] = useState(false); // ← Add this

  useEffect(() => {
    setMounted(true); // ← Set mounted to true
    
    // Check initial connection state
    setConnected(pusherClient.connection.state === 'connected');
    
    // Listen for connection state changes
    pusherClient.connection.bind('connected', () => {
      setConnected(true);
      console.log('✅ Pusher connected!');
    });

    pusherClient.connection.bind('disconnected', () => {
      setConnected(false);
      console.log('❌ Pusher disconnected!');
    });

    pusherClient.connection.bind('error', (err: any) => {
      console.error('Pusher error:', err);
    });

    return () => {
      pusherClient.connection.unbind_all();
    };
  }, []);

  // Listen for test events
  usePusherEvent('test-channel', 'test-event', (data: { message: string }) => {
    console.log('Received message:', data);
    setMessages((prev) => [...prev, data.message]);
  });

  // ← Add this check
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Pusher Connection Test
          </h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Pusher Connection Test
        </h1>

        {/* Connection Status */}
        <div className="mb-6 p-4 rounded-lg border-2">
          <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={`font-medium ${
              connected ? 'text-green-600' : 'text-red-600'
            }`}>
              {connected ? 'Connected ✓' : 'Disconnected ✗'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            State: {pusherClient.connection.state}
          </p>
        </div>

        {/* Configuration Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-blue-900">
            Configuration:
          </h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>App Key:</strong> {process.env.NEXT_PUBLIC_PUSHER_APP_KEY}
            </li>
            <li>
              <strong>Cluster:</strong> {process.env.NEXT_PUBLIC_PUSHER_CLUSTER}
            </li>
            <li>
              <strong>Channel:</strong> test-channel
            </li>
            <li>
              <strong>Event:</strong> test-event
            </li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <h2 className="text-lg font-semibold mb-2 text-yellow-900">
            How to Test:
          </h2>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            <li>Make sure your Pusher credentials are correct in <code>.env</code></li>
            <li>Open Pusher Dashboard → Debug Console</li>
            <li>Send a test event:
              <ul className="ml-6 mt-1 list-disc">
                <li><strong>Channel:</strong> test-channel</li>
                <li><strong>Event:</strong> test-event</li>
                <li><strong>Data:</strong> {`{ "message": "Hello from Pusher!" }`}</li>
              </ul>
            </li>
            <li>You should see the message appear below!</li>
          </ol>
        </div>

        {/* Received Messages */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Received Messages ({messages.length}):
          </h2>
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">
              No messages received yet. Send a test event from Pusher Dashboard!
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="bg-green-50 border-l-4 border-green-500 p-3 rounded"
                >
                  <p className="text-green-900 font-medium">
                    {i + 1}. {msg}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <a
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}