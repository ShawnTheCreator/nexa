"use client";

import { Card, TextInput } from "@tremor/react";
import Link from "next/link";

const Logo = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M9 2L10.5 7L15 8.5L10.5 10L9 15L7.5 10L3 8.5L7.5 7L9 2Z" />
    <path d="M15 11L16 14L19 15L16 16L15 19L14 16L11 15L14 14L15 11Z" />
    <path d="M6 16L7 18L9 19L7 20L6 22L5 20L3 19L5 18L6 16Z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-10 lg:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo
          className="mx-auto h-10 w-10 text-tremor-content-strong dark:text-dark-tremor-content-strong"
          aria-hidden={true}
        />
        <h3 className="mt-6 text-center text-tremor-title font-bold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Reset your password
        </h3>
        <p className="text-tremor-label text-center text-tremor-content dark:text-dark-tremor-content">
          Enter your email to receive a reset link
        </p>
      </div>

      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form action="#" method="post" className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
            >
              Email
            </label>
            <TextInput
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="name@eduvos.com"
              className="mt-2"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
          >
            Send Reset Link
          </button>

          <p className="text-center text-tremor-label text-tremor-content dark:text-dark-tremor-content">
            We'll send you a link to reset your password
          </p>
        </form>
      </Card>

      <p className="mt-6 text-center text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        Remember your password?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand hover:dark:text-dark-tremor-brand-emphasis"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
