import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <h1 className="text-2xl font-semibold text-center mb-6">שחזור סיסמא</h1>
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
        </div>

        <SubmitButton 
          formAction={forgotPasswordAction}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          שחזור סיסמא
        </SubmitButton>
        
        <FormMessage message={searchParams} />
      </form>
    </>
  );
}
