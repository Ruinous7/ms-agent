import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <h1 className="text-2xl font-semibold text-center mb-6">התחברות</h1>
      <p className="text-sm text-secondary-foreground text-center mb-8">
        אין לך חשבון?{" "}
        <Link className="text-primary underline" href="/sign-up">
          הרשמה
        </Link>
      </p>

      <form className="flex flex-col w-full gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="email" className="text-sm font-medium">אימייל</Label>
            </div>
            <Input 
              name="email" 
              id="email"
              placeholder="you@example.com" 
              required 
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">סיסמא</Label>
              <Link
                className="text-xs text-primary underline"
                href="/forgot-password"
              >
                שכחתי את הסיסמא?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="סיסמא שלך"
              required
              className="w-full"
            />
          </div>
        </div>

        <SubmitButton 
          pendingText="מתחבר..." 
          formAction={signInAction}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          התחבר
        </SubmitButton>
        
        <FormMessage message={searchParams} />
      </form>
    </>
  );
}
