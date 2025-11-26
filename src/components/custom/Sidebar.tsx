'use client';

import Link from 'next/link';
import { Home, FileText, Upload, Settings, Moon, Sun, LayoutDashboard, PieChart, Users } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: PieChart, label: 'Analytics', href: '/analytics' },
    { icon: Users, label: 'Team', href: '/team' },
  ];

  const generalItems = [
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Lumi</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-4 mb-2 uppercase tracking-wider">Menu</p>
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 font-medium",
                pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-4 mb-2 uppercase tracking-wider">General</p>
          {generalItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-3 font-medium text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-sidebar-accent/50 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium mb-1">Pro Plan</p>
          <p className="text-xs text-muted-foreground mb-3">Get access to all features</p>
          <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Upgrade
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
      </div>
    </aside>
  );
}
