'use client';
import { useState } from 'react';
import {
  Divider,
  Select,
  SelectItem,
  TextInput,
} from '@tremor/react';
import Link from 'next/link';

const Logo = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M9 2L10.5 7L15 8.5L10.5 10L9 15L7.5 10L3 8.5L7.5 7L9 2Z" />
    <path d="M15 11L16 14L19 15L16 16L15 19L14 16L11 15L14 14L15 11Z" />
    <path d="M6 16L7 18L9 19L7 20L6 22L5 20L3 19L5 18L6 16Z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export default function Example() {
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    const commonMistakes = ['.con', '.comm', '.co', '.om'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (commonMistakes.some(mistake => domain?.endsWith(mistake))) {
      return false;
    }
    
    return true;
  };

  const getEmailErrorMessage = (email: string) => {
    if (!email) return '';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain?.endsWith('.con')) {
      return 'Did you mean .com instead of .con?';
    }
    if (domain?.endsWith('.comm')) {
      return 'Did you mean .com instead of .comm?';
    }
    
    return '';
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    const errorMessage = getEmailErrorMessage(email);
    setEmailError(errorMessage);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const errorMessage = validatePassword(password);
    setPasswordError(errorMessage);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;
    
    if (confirmPassword && password && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    
    if (!validateEmail(email)) {
      setEmailError(getEmailErrorMessage(email) || 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    
    console.log('Registration form submitted');
  };

  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
          <div className="text-center mb-8">
            <Logo
              className="mx-auto h-10 w-10 text-tremor-content-strong dark:text-dark-tremor-content-strong"
              aria-hidden={true}
            />
            <h3 className="mt-6 text-center text-tremor-title font-bold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Create new account
            </h3>
            <p className="mt-2 text-center text-xs text-tremor-content/70 dark:text-dark-tremor-content/70">
              Innovation Management Platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-tremor-background dark:bg-dark-tremor-background p-8 rounded-tremor-default shadow-tremor-card dark:shadow-dark-tremor-card">
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <h2 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  Personal Information
                </h2>
                <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                  Please provide your personal details for account creation.
                </p>
              </div>
              <div className="sm:max-w-3xl md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="first-name"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      First Name
                    </label>
                    <TextInput
                      type="text"
                      id="first-name"
                      name="first-name"
                      autoComplete="given-name"
                      placeholder="name"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="last-name"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Last Name
                    </label>
                    <TextInput
                      type="text"
                      id="last-name"
                      name="last-name"
                      autoComplete="family-name"
                      placeholder="surname"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div className="col-span-full">
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
                      onChange={handleEmailChange}
                      error={!!emailError}
                      required
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {emailError}
                      </p>
                    )}
                  </div>
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="student-number"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Student Number
                    </label>
                    <TextInput
                      type="text"
                      id="student-number"
                      name="student-number"
                      placeholder="eduv123456"
                      className="mt-2"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Divider className="my-14" />

            {/* Academic Information Section */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <h2 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  Academic Information
                </h2>
                <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                  Select your campus, faculty, and programme details.
                </p>
              </div>
              <div className="sm:max-w-3xl md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="campus"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Campus
                    </label>
                    <Select name="campus" placeholder="Select your campus" className="mt-2" required>
                      <SelectItem value="bedfordview">Bedfordview</SelectItem>
                      <SelectItem value="cape-town">Cape Town</SelectItem>
                      <SelectItem value="durban">Durban</SelectItem>
                      <SelectItem value="johannesburg">Johannesburg</SelectItem>
                      <SelectItem value="pretoria">Pretoria</SelectItem>
                      <SelectItem value="vanderbijlpark">Vanderbijlpark</SelectItem>
                    </Select>
                  </div>
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="faculty"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Faculty
                    </label>
                    <Select name="faculty" placeholder="Select your faculty" className="mt-2" required>
                      <SelectItem value="information-technology">Information Technology</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                      <SelectItem value="humanities">Humanities</SelectItem>
                      <SelectItem value="design">Design & Multimedia</SelectItem>
                    </Select>
                  </div>
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="programme"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Programme
                    </label>
                    <Select name="programme" placeholder="Select your programme" className="mt-2" required>
                      <SelectItem value="hc-info-systems">Higher Certificate in Information Systems</SelectItem>
                      <SelectItem value="bsc-computer-science">BSc Computer Science</SelectItem>
                      <SelectItem value="bsc-hons-it">BSc Honours in Information Technology</SelectItem>
                      <SelectItem value="ba-graphic-design">BA Graphic Design</SelectItem>
                      <SelectItem value="bcom">Bachelor of Commerce</SelectItem>
                    </Select>
                  </div>
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="year-of-study"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Year of Study
                    </label>
                    <Select name="year-of-study" placeholder="Select year" className="mt-2" required>
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="honours">Honours</SelectItem>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Divider className="my-14" />

            {/* Security Settings Section */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <h2 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  Security Settings
                </h2>
                <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                  Create a secure password for your account.
                </p>
              </div>
              <div className="sm:max-w-3xl md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="password"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Password
                    </label>
                    <TextInput
                      type="password"
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="Password"
                      className="mt-2"
                      onChange={handlePasswordChange}
                      error={!!passwordError}
                      required
                    />
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {passwordError}
                      </p>
                    )}
                  </div>
                  <div className="col-span-full sm:col-span-3">
                    <label
                      htmlFor="confirm-password"
                      className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                    >
                      Confirm Password
                    </label>
                    <TextInput
                      type="password"
                      id="confirm-password"
                      name="confirm-password"
                      autoComplete="new-password"
                      placeholder="Confirm Password"
                      className="mt-2"
                      onChange={handleConfirmPasswordChange}
                      error={!!confirmPasswordError}
                      required
                    />
                    {confirmPasswordError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Divider className="my-14" />

            {/* Terms and Actions */}
            <div className="space-y-6">
              <p className="text-center text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                By signing up, you agree to our{' '}
                <a
                  href="#"
                  className="capitalize text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand hover:dark:text-dark-tremor-brand-emphasis"
                >
                  Terms of use
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="capitalize text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand hover:dark:text-dark-tremor-brand-emphasis"
                >
                  Privacy policy
                </a>
              </p>

              <div className="flex items-center justify-end space-x-4">
                <Link
                  href="/auth/login"
                  className="whitespace-nowrap rounded-tremor-small px-4 py-2.5 text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted"
                >
                  Already have an account?
                </Link>
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-tremor-default bg-tremor-brand px-4 py-2.5 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
                >
                  Create Account
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}