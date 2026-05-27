"use client";

import { useSyncExternalStore } from "react";

import {
  AUTH_SESSION_CHANGED_EVENT,
  AUTH_STORAGE_KEY,
  getStoredSession
} from "./authStorage";
import type { DevSession } from "../types/auth";

function subscribe(listener: () => void): () => void {
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): string {
  return window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

export function useDevSession(): DevSession | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!snapshot) {
    return null;
  }

  return getStoredSession();
}
