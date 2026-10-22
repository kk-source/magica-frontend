"use client";

import { useState } from "react";
import { Clapperboard, Crop, Film, ImagePlus, Megaphone, Palette, PenLine, Wand2, type LucideIcon } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Viral Video Formats",
  "Video Special Effects",
  "Content Creation",
  "Branding & Design",
  "Image & Editing",
] as const;
type Category = (typeof CATEGORIES)[number];

const TEMPLATES: { title: string; prompt: string; category: Exclude<Category, "All">; icon: LucideIcon; gradient: string }[] = [
  {
    title: "Generate a product hero shot",
    prompt: "Generate a studio-lit hero shot of a matte black water bottle on a marble surface.",
    category: "Image & Editing",
    icon: ImagePlus,
    gradient: "from-fuchsia-600/60 to-indigo-700/60",
  },
  {
    title: "Crop an image for Instagram",
    prompt: "Crop my uploaded image to a 1:1 square centered on the subject.",
    category: "Image & Editing",
    icon: Crop,
    gradient: "from-amber-500/60 to-rose-600/60",
  },
  {
    title: "Merge clips into a reel",
    prompt: "Merge my uploaded video clips into a single reel in the order I uploaded them.",
    category: "Viral Video Formats",
    icon: Film,
    gradient: "from-sky-500/60 to-cyan-700/60",
  },
  {
    title: "Build a short video montage",
    prompt: "Combine these clips into a 30-second montage for a product launch.",
    category: "Video Special Effects",
    icon: Clapperboard,
    gradient: "from-emerald-500/60 to-teal-700/60",
  },
  {
    title: "Write a launch announcement",
    prompt: "Write a punchy launch announcement for a new AI design tool, with a matching cover image.",
    category: "Content Creation",
    icon: Megaphone,
    gradient: "from-orange-500/60 to-red-700/60",
  },
  {
    title: "Draft a blog post with visuals",
    prompt: "Draft a 600-word blog post about remote work tips and generate a header illustration.",
    category: "Content Creation",
    icon: PenLine,
    gradient: "from-violet-500/60 to-purple-800/60",
  },
  {
    title: "Design a brand logo mark",
    prompt: "Design a minimal logo mark for a coffee brand called Ember, on a plain background.",
    category: "Branding & Design",
    icon: Palette,
    gradient: "from-pink-500/60 to-rose-800/60",
  },
  {
    title: "Restyle a photo as watercolor",
    prompt: "Turn my uploaded photo into a soft watercolor painting.",
    category: "Image & Editing",
    icon: Wand2,
    gradient: "from-lime-500/60 to-green-800/60",
  },
];

export function TemplateGallery() {
  const [category, setCategory] = useState<Category>("All");
  const setComposerValue = useUiStore((s) => s.setComposerValue);
  const visible = category === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  return (
    <section className="w-full">
      <div className="mb-4 flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "h-[34px] shrink-0 rounded-[10px] px-3 text-sm font-medium transition-colors",
              c === category ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ title, prompt, icon: Icon, gradient }) => (
          <button
            key={title}
            onClick={() => setComposerValue(prompt)}
            className="group overflow-hidden rounded-xl bg-card text-left transition-colors hover:bg-accent"
          >
            <div className={cn("flex aspect-[16/9] items-center justify-center bg-gradient-to-br", gradient)}>
              <Icon className="size-10 text-white/90 transition-transform group-hover:scale-110" strokeWidth={1.5} />
            </div>
            <p className="truncate px-2 py-2.5 text-sm">{title}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
