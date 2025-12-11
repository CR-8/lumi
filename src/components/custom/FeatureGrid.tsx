"use client";

import { Card } from "@/components/ui/card";
import { Eye, Palette, Zap, Sparkles } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "WCAG Compliance",
    description: "Comprehensive accessibility checks against WCAG guidelines",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Palette,
    title: "Color Analysis",
    description: "Deep color contrast and palette harmony evaluation",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Real-time analysis with actionable insights",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Advanced AI insights for better design decisions",
    color: "from-green-500 to-emerald-500"
  }
];

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
      {features.map((feature, index) => (
        <Card 
          key={index}
          className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50 group"
        >
          <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </Card>
      ))}
    </div>
  );
}
