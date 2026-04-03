import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { CrowdStatus } from '../types';

export const useAllCrowdSockets = () => {
  const [statuses, setStatuses] = useState<Record<number, CrowdStatus>>({});
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/crowd/all', (message) => {
          if (message.body) {
            const status: CrowdStatus = JSON.parse(message.body);
            setStatuses((prev) => ({ ...prev, [status.placeId]: status }));
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return statuses;
};
