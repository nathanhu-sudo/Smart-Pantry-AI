import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";
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
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [checkEmailType, setCheckEmailType] = useState<"signup" | "forgot">("signup");

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err.message || `Failed to sign in with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-4">
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

            {/* Social login (hidden on check-email and forgot) */}
            {mode !== "check-email" && mode !== "forgot" && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs text-muted-foreground">
                    <span className="bg-card px-3">or continue with</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleSocialLogin("google")}
                    disabled={socialLoading !== null}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {socialLoading === "google" ? "Connecting…" : "Continue with Google"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleSocialLogin("apple")}
                    disabled={socialLoading !== null}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.07-.49-2.04-.48-3.16 0-1.4.62-2.14.44-3-.38C2.79 15.26 3.51 7.4 9.05 7.1c1.32.07 2.23.72 3 .77.96-.2 1.88-.77 3.13-.83 1.5-.08 2.62.54 3.39 1.59-3.12 1.84-2.6 5.96.48 7.24-.58 1.54-1.33 3.06-2 3.41zM12.03 7.04c-.18-2.38 1.88-4.35 4.08-4.54.28 2.4-1.95 4.55-4.08 4.54z"/>
                    </svg>
                    {socialLoading === "apple" ? "Connecting…" : "Continue with Apple"}
                  </Button>
                </div>
              </>
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
      <Footer />
    </div>
  );
};

export default Auth;
