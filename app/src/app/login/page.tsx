'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const userData = await res.json();
        login(userData);
        router.push('/');
      } else {
        const { error } = await res.json();
        setError(error);
      }
    } catch (error) {
      setError('Failed to log in. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen bg-white">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <Image src="/kavodax-round-logo.png" alt="Kavodax Logo" width={120} height={120} className="rounded-full" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy">Login</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-navy">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 mt-1 bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-navy"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 mt-1 bg-white border border-gray-300 rounded-lg"
              />
            </div>
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-orange-main rounded-lg hover:bg-orange-hover active:bg-orange-pressed"
            >
              Login
            </button>
          </form>
          <p className="text-sm text-center text-grey">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-orange-main hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
        <div className="w-full h-full relative flex items-center justify-center">
          <Image
            src="/login-page-image.png"
            alt="Blockchain illustration"
            width={600}
            height={600}
            unoptimized
          />
        </div>
      </div>
    </main>
  );
} 