"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Register() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600">Sign up to get started</p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
        >
          <Image
            src="/google.svg"
            alt="Google Logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
