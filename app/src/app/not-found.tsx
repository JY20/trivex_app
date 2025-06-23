import Link from 'next/link';

// Add viewport export to fix metadata warning
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-block bg-orange-main hover:bg-orange-hover text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 