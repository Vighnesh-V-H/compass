"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { signUp } from "@/lib/auth-client";
// import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`,
      callbackURL: "/projects",
      fetchOptions: {
        onResponse: () => {
          setLoading(false);
        },
        onRequest: () => {
          setLoading(true);
        },
        onError: (ctx) => {},
        onSuccess: async () => {
          router.push("/auth/signin");
        },
      },
    });
  };

  return (
    <Card className='z-50 rounded-md rounded-t-none max-w-md'>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className='text-lg md:text-xl'>Sign Up</CardTitle>
          <CardDescription className='text-xs md:text-sm'>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='first-name'>First name</Label>
                <Input
                  id='first-name'
                  placeholder='Max'
                  required
                  onChange={(e) => {
                    setFirstName(e.target.value);
                  }}
                  value={firstName}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='last-name'>Last name</Label>
                <Input
                  id='last-name'
                  placeholder='Robinson'
                  required
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                  value={lastName}
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='new-password'
                placeholder='Password'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password_confirmation'>Confirm Password</Label>
              <Input
                id='password_confirmation'
                type='password'
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                autoComplete='new-password'
                placeholder='Confirm Password'
                required
              />
            </div>
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                "Create an account"
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
