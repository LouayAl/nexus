"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { getToken } from "@/lib/api";

export function useNotificationSocket(userId: number | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(
      process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001",
      {
        auth:         { token: getToken() },
        transports:   ["websocket"],
        reconnection: true,
      }
    );

    socket.on("connect", () => {
      socket.emit("join", { userId });
    });

    socket.on("notification", (payload: {
      message: string;
      type?: "success" | "info" | "warning";
    }) => {
      if (payload.type === "success") toast.success(payload.message, { duration: 5000 });
      else                            toast(payload.message,         { duration: 5000 });
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [userId]);

  return socketRef;
}