"use client";

import Link from "next/link";
import { 
  Home, 
  Image as ImageIcon, 
  Palette, 
  Layers, 
  Eye, 
  Zap,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "All Types", href: "/", badge: null },
    { icon: ImageIcon, label: "Upload Image", href: "#upload", badge: null },
    { icon: Palette, label: "Color Analysis", href: "#colors", badge: null },
    { icon: Layers, label: "Hierarchy Check", href: "#hierarchy", badge: null },
    { icon: Sparkles, label: "AI Insights", href: "#ai", badge: null },
    { icon: Info, label: "Guidelines", href: "#guide", badge: null },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/40 flex flex-col z-50 shadow-soft">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 flex items-center justify-center shadow-medium">
            <span className="text-primary-foreground font-bold text-xl">L</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Lumi</span>
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 scale-[0.98]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-[0.98]"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="w-4.5 h-4.5" />
                  <span className="flex-1 text-left font-semibold text-sm">
                    {item.label}
                  </span>
                </Link>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-8 p-5 glass-strong rounded-2xl">
          <p className="text-xs font-bold mb-2 text-foreground">Never run out of design inspiration</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI-powered accessibility insights for better design decisions.
          </p>
        </div>
      </div>

      {/* Theme Toggle at Bottom */}
      <div className="p-6 border-t border-sidebar-border/40">
        <div className="flex items-center justify-between p-3 rounded-xl glass-strong">
          <span className="text-sm font-semibold">Appearance</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
