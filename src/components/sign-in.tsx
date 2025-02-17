"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";

import { signInWithGoogle } from "@/app/actions";

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      onClick={() => {
        setIsLoading(true);
        signInWithGoogle();
      }}
      disabled={isLoading}
      className="w-full max-w-sm flex items-center gap-2"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
      ) : (
        <Image
          src="/google.png"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      )}
      <span>Sign in with Google</span>
    </Button>
  );
}
