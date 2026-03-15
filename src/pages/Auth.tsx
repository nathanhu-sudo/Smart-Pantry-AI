import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

type AuthMode = "login" | "signup" | "forgot" | "check-email";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkEmailType, setCheckEmailType] = useState<"signup" | "forgot">("signup");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setCheckEmailType("signup");
        setMode("check-email");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setCheckEmailType("forgot");
        setMode("check-email");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<AuthMode, string> = {
    login: "Welcome back",
    signup: "Join SmartPantry",
    forgot: "Reset password",
    "check-email": checkEmailType === "signup" ? "Check your email" : "Reset link sent",
  };

  const descriptions: Record<AuthMode, string> = {
    login: "Sign in to your kitchen's digital twin",
    signup: "Start tracking your green impact today",
    forgot: "We'll send you a reset link",
    "check-email":
      checkEmailType === "signup"
        ? `We sent a confirmation email to ${email}`
        : `We sent a password reset link to ${email}`,
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="rounded-full bg-primary p-2">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground font-serif">SmartPantry AI</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <CardTitle className="font-serif">{titles[mode]}</CardTitle>
                <CardDescription className="mt-1">{descriptions[mode]}</CardDescription>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent>
            {/* Check email screen */}
            {mode === "check-email" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 py-4"
              >
                <div className="rounded-full bg-primary/10 p-5">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    {checkEmailType === "signup"
                      ? "Almost there! Please verify your email."
                      : "Check your inbox for the reset link."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {checkEmailType === "signup"
                      ? "Click the confirmation link in the email we sent to activate your account. Don't forget to check your spam folder."
                      : "Click the link in the email to set a new password. The link expires in 1 hour."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMode("login");
                    setPassword("");
                  }}
                >
                  Back to sign in
                </Button>
                {checkEmailType === "signup" && (
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { error } = await supabase.auth.resend({
                          type: "signup",
                          email,
                          options: { emailRedirectTo: window.location.origin },
                        });
                        if (error) throw error;
                        toast.success("Confirmation email resent!");
                      } catch (err: any) {
                        toast.error(err.message || "Failed to resend email");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="text-sm text-primary hover:underline"
                  >
                    {loading ? "Sending…" : "Resend confirmation email"}
                  </button>
                )}
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password (hidden in forgot mode) */}
                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Forgot password link */}
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm text-primary hover:underline self-end -mt-1"
                  >
                    Forgot password?
                  </button>
                )}

                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading
                    ? "Please wait…"
                    : mode === "forgot"
                    ? "Send reset link"
                    : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            )}

            {/* Mode toggle (hidden on check-email) */}
            {mode !== "check-email" && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                      Sign in
                    </button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
