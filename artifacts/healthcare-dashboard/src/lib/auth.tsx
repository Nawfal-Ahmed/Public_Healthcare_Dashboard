import { createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";
import {
  User,
  useGetCurrentUser,
  getGetCurrentUserQueryKey,
  useLoginUser,
  useLogoutUser,
  LoginBody,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginBody) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
    },
  });

  const loginMutation = useLoginUser();
  const logoutMutation = useLogoutUser();

  const login = async (data: LoginBody) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      queryClient.setQueryData(getGetCurrentUserQueryKey(), res.user);
      toast({ title: "Welcome back", description: res.message });
      if (res.user.role === "admin") {
        setLocation("/admin/alerts");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.error || "Invalid credentials",
        variant: "destructive",
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (err: any) {
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
