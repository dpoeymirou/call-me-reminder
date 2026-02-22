import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface WebSocketMessage {
  type: string;
  data: {
    id: string;
    status: string;
  };
}

export function useRealTimeUpdates() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = apiUrl.replace("http", "ws") + "/ws";
    console.log("Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === "reminder_update") {
          queryClient.invalidateQueries({ queryKey: ["reminders"] });
          console.log("WebSocket update received:", message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Don't immediately reconnect on error, wait a bit
      wsRef.current = null;
    };

    ws.onclose = (event) => {
      console.log(
        "WebSocket disconnected, code:",
        event.code,
        "reason:",
        event.reason,
      );
      wsRef.current = null;

      // Don't reconnect if it's a normal closure
      if (event.code === 1000) {
        console.log("WebSocket closed normally");
        return;
      }

      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect...");
        connect();
      }, 3000);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
