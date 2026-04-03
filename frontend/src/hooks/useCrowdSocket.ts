import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { CrowdStatus } from '../types';

export const useCrowdSocket = (placeId: string | undefined) => {
  const [status, setStatus] = useState<CrowdStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!placeId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe(`/topic/crowd/${placeId}`, (message) => {
          if (message.body) {
            setStatus(JSON.parse(message.body));
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [placeId]);

  return { status, isConnected };
};
