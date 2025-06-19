import { AuthClient } from "@dfinity/auth-client";
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { useState, useEffect } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: Principal | null;
}

class AuthService {
  private authClient: AuthClient | null = null;
  private listeners: ((authState: AuthState) => void)[] = [];

  async init(): Promise<void> {
    this.authClient = await AuthClient.create();

    // Check if user is already authenticated
    const isAuthenticated = await this.authClient.isAuthenticated();
    if (isAuthenticated) {
      this.notifyListeners();
    }
  }

  async login(): Promise<void> {
    if (!this.authClient) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.authClient!.login({
        identityProvider:
          process.env.NODE_ENV === "development"
            ? `http://localhost:4943/?canisterId=${process.env.VITE_INTERNET_IDENTITY_CANISTER_ID || "rdmx6-jaaaa-aaaaa-aaadq-cai"}`
            : "https://identity.ic0.app",
        onSuccess: () => {
          this.notifyListeners();
          resolve();
        },
        onError: (error) => {
          console.error("Login failed:", error);
          reject(error);
        },
      });
    });
  }

  async logout(): Promise<void> {
    if (!this.authClient) {
      return;
    }

    await this.authClient.logout();
    this.notifyListeners();
  }

  getAuthState(): AuthState {
    if (!this.authClient) {
      return {
        isAuthenticated: false,
        identity: null,
        principal: null,
      };
    }

    const identity = this.authClient.getIdentity();
    const isAuthenticated = identity.getPrincipal().toString() !== "2vxsx-fae";

    return {
      isAuthenticated,
      identity: isAuthenticated ? identity : null,
      principal: isAuthenticated ? identity.getPrincipal() : null,
    };
  }

  subscribe(listener: (authState: AuthState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const authState = this.getAuthState();
    this.listeners.forEach((listener) => listener(authState));
  }
}

export const authService = new AuthService();

// React hook for authentication
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() =>
    authService.getAuthState(),
  );

  useEffect(() => {
    // Initialize auth service
    authService.init();

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState);

    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: () => authService.login(),
    logout: () => authService.logout(),
  };
}
