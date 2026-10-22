"use client";

import { useState } from "react";
import { Clapperboard, Crop, Film, ImagePlus, Megaphone, PenLine, type LucideIcon } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Image Generation", "Video Effects", "Content Creation"] as const;
type Category = (typeof CATEGORIES)[number];

const TEMPLATES: { title: string; prompt: string; category: Exclude<Category, "All">; icon: LucideIcon; gradient: string }[] = [
  {
    title: "Generate a product hero shot",
    prompt: "Generate a studio-lit hero shot of a matte black water bottle on a marble surface.",
    category: "Image Generation",
    icon: ImagePlus,
    gradient: "from-fuchsia-600/60 to-indigo-700/60",
  },
  {
    title: "Crop an image for Instagram",
    prompt: "Generate a wide 16:9 photo of a lighthouse at sunset, then crop it to a centered 1:1 square for Instagram.",
    category: "Image Generation",
    icon: Crop,
    gradient: "from-amber-500/60 to-rose-600/60",
  },
  {
    title: "Merge clips into a reel",
    prompt: "Merge these clips into a single reel in this order: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4 https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    category: "Video Effects",
    icon: Film,
    gradient: "from-sky-500/60 to-cyan-700/60",
  },
  {
    title: "Build a short video montage",
    prompt: "Combine these clips into one montage with fade transitions: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4 https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4 https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    category: "Video Effects",
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
];

export function TemplateGallery() {
  const [category, setCategory] = useState<Category>("All");
  const setComposerValue = useUiStore((s) => s.setComposerValue);
  const visible = category === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border border-white/10 px-3.5 py-1.5 text-sm transition-colors",
              c === category ? "bg-white text-black" : "text-white/70 hover:bg-white/5",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ title, prompt, icon: Icon, gradient }) => (
          <button
            key={title}
            onClick={() => setComposerValue(prompt)}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-[#161616] text-left transition-colors hover:border-white/25"
          >
            <div className={cn("flex aspect-[16/9] items-center justify-center bg-gradient-to-br", gradient)}>
              <Icon className="size-10 text-white/90 transition-transform group-hover:scale-110" />
            </div>
            <p className="px-3 py-2.5 text-sm font-medium">{title}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
