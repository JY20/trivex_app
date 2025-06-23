'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== retypePassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
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
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen bg-white">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Image src="/kavodax-round-logo.png" alt="Kavodax Logo" width={120} height={120} className="rounded-full" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy">Create an account</h1>
            <p className="text-grey mt-2">Send money cross-border instantly</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-navy">First Name</label>
              <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-3 mt-1 bg-white border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-navy">Last Name</label>
              <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-3 mt-1 bg-white border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-navy">Your email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 mt-1 bg-white border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-navy">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 mt-1 bg-white border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label htmlFor="retypePassword" className="text-sm font-medium text-navy">Retype password</label>
              <input id="retypePassword" type="password" value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} required className="w-full p-3 mt-1 bg-white border border-gray-300 rounded-lg"/>
            </div>

            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <button type="submit" className="w-full py-3 font-bold text-white bg-orange-main rounded-lg hover:bg-orange-hover active:bg-orange-pressed">
              Register
            </button>
          </form>
          <p className="text-sm text-center text-grey">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-orange-main hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
        <div className="w-full h-full bg-gradient-to-br from-yellow-300 via-red-400 to-indigo-500 rounded-3xl relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10" style={{mixBlendMode: 'multiply'}}></div>
          <Image
            src="/money-transfer-animation-register.gif"
            alt="Money transfer animation"
            width={400}
            height={400}
            unoptimized
          />
        </div>
      </div>
    </main>
  );
} 