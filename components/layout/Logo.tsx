import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
        <span className="text-xl font-bold">E</span>
      </div>
      <span className="text-xl font-bold text-gray-900">
        EduKids Academy
      </span>
    </Link>
  );
} 