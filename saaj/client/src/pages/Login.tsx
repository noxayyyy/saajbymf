import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast({ title: "Welcome back", description: `Signed in as ${user.firstName}` });
      setTimeout(() => {
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/account");
        }
      }, 100);
    } catch (error: any) {
      toast({ title: "Sign in failed", description: error.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl tracking-wide mb-2">Sign In</h1>
          <p className="font-sans text-sm text-muted-foreground tracking-wide">
            Welcome back to SAAJ by MF
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-sans text-xs tracking-[0.15em] uppercase">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border-border/60 rounded-none font-sans text-sm"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-sans text-xs tracking-[0.15em] uppercase">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 border-border/60 rounded-none font-sans text-sm"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs tracking-[0.2em] uppercase"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-sans text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-foreground underline underline-offset-4 hover:text-primary cursor-pointer">
                Create Account
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
