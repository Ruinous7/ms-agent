import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-center">הרשמה</h1>
        <FormMessage message={searchParams} />
        <Link href="/sign-up" className="text-primary underline mt-4">
          נסה שוב
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-center mb-6">הרשמה</h1>
      <p className="text-sm text-secondary-foreground text-center mb-8">
        כבר יש לך חשבון?{" "}
        <Link className="text-primary underline" href="/sign-in">
          התחבר
        </Link>
      </p>

      <form className="flex flex-col w-full gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">אימייל</Label>
            <Input 
              name="email" 
              id="email"
              placeholder="you@example.com" 
              required 
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">סיסמא</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="סיסמא שלך"
              minLength={6}
              required
              className="w-full"
            />
          </div>
        </div>

        <SubmitButton 
          formAction={signUpAction} 
          pendingText="נרשם..."
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          הרשמה
        </SubmitButton>
        
        <FormMessage message={searchParams} />
      </form>
    </>
  );
}
