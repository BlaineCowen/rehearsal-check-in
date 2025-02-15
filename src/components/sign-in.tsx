"use client";

import { signInWithGoogle } from "@/app/actions";

export default function SignIn() {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded flex items-center gap-2"
      >
        <img src="/google.svg" alt="Google" className="w-5 h-5" />
        Sign in with Google
      </button>
    </form>
  );
}
