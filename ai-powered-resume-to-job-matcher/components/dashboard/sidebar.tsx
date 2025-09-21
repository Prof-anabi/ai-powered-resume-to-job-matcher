'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon?: React.ReactNode;
  }[];
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  
  const items = [
    { href: '/dashboard', title: 'Dashboard' },
    { href: '/dashboard/jobs', title: 'Jobs' },
    { href: '/dashboard/applications', title: 'Applications' },
    { href: '/dashboard/resumes', title: 'Resumes' },
    { href: '/dashboard/matches', title: 'Matches' },
    { href: '/dashboard/profile', title: 'Profile' },
  ];

  return (
    <div className={cn("w-64 h-full bg-background border-r", className)}>
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="font-bold text-xl">Resume Matcher</Link>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center py-2 px-4 rounded-md hover:bg-accent",
                    pathname === item.href && "bg-accent font-medium"
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Link 
            href="/auth/logout" 
            className="flex items-center py-2 px-4 rounded-md hover:bg-accent w-full"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}