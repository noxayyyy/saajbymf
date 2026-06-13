import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast({ title: "Welcome to SAAJ", description: "Your account has been created" });
      navigate("/account");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl tracking-wide mb-2">Create Account</h1>
          <p className="font-sans text-sm text-muted-foreground tracking-wide">
            Join the SAAJ by MF family
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-sans text-xs tracking-[0.15em] uppercase">First Name</Label>
              <Input id="firstName" value={form.firstName} onChange={update("firstName")} required className="h-12 border-border/60 rounded-none font-sans text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-sans text-xs tracking-[0.15em] uppercase">Last Name</Label>
              <Input id="lastName" value={form.lastName} onChange={update("lastName")} required className="h-12 border-border/60 rounded-none font-sans text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-sans text-xs tracking-[0.15em] uppercase">Email Address</Label>
            <Input id="email" type="email" value={form.email} onChange={update("email")} required className="h-12 border-border/60 rounded-none font-sans text-sm" placeholder="your@email.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-sans text-xs tracking-[0.15em] uppercase">Phone (Optional)</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} className="h-12 border-border/60 rounded-none font-sans text-sm" placeholder="+92 300 0000000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-sans text-xs tracking-[0.15em] uppercase">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={update("password")} required minLength={6} className="h-12 border-border/60 rounded-none font-sans text-sm" placeholder="Minimum 6 characters" />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-sans text-xs tracking-[0.2em] uppercase"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-sans text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-foreground underline underline-offset-4 hover:text-primary cursor-pointer">
                Sign In
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
