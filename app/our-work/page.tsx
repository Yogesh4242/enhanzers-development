'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

declare global {
  interface Window {
    Lenis: any;
  }
}

const projects = [
  {
    id: 1,
    title: "DREAMWALK",
    category: "Product Design",
    year: "2024",
    image: "/DREAMWALKER.png",
    hoverImage: "/DREAMWALKER-1.png",
    description: "UX/UI architecture and robust frontend development for a next-generation product.",
    tags: ["React", "TypeScript", "App"],
    url: "https://dreamwalk-enhanzers-product.vercel.app"
  },
  {
    id: 2,
    title: "CAFE",
    category: "Architecture",
    year: "2024",
    image: "/CAFE.png",
    hoverImage: "/CAFE-1.png",
    description: "High-end 3D visualization and immersive experience for a modern cafe concept.",
    tags: ["WebGL", "3D", "Interactive"],
    url: "https://3d-cafe-site.vercel.app"
  },
  {
    id: 3,
    title: "MSJ DOOR",
    category: "Architecture",
    year: "2024",
    image: "/msj door palace.png",
    hoverImage: "/msj door palace 0.png",
    description: "Premium door design and architectural visualization showcase.",
    tags: ["3D", "Visualization", "Design"],
    url: "https://msj-door-palace.vercel.app"
  },
  {
    id: 4,
    title: "ARCHI PORTFOLIO",
    category: "Architecture",
    year: "2024",
    image: "/archi portfolio.png",
    hoverImage: "/archi portfolio 0.png",
    description: "Architectural portfolio showcasing stunning structural designs and concepts.",
    tags: ["Portfolio", "BIM", "Design"],
    url: "https://archi-portfolio-bay.vercel.app"
  },
  {
    id: 5,
    title: "MSJ TRADERS",
    category: "Corporate Identity",
    year: "2024",
    image: "/msj traders.png",
    hoverImage: "/msj traders 0.png",
    description: "Corporate identity and digital presence for a leading trading conglomerate.",
    tags: ["Next.js", "E-commerce", "Branding"],
    url: "https://msjtraders.com/"
  },
  {
    id: 6,
    title: "VOID",
    category: "Product Design",
    year: "2024",
    image: "/void.png",
    hoverImage: "void 0.png",
    description: "Code travels and modern web development platform.",
    tags: ["React", "Node.js", "Travel"],
    url: "https://code-travels.onrender.com/"
  },
  {
    id: 7,
    title: "SKS",
    category: "Corporate Identity",
    year: "2024",
    image: "/sks groups.png",
    hoverImage: "/sks groups 0.png",
    description: "Client showcase and digital transformation success stories.",
    tags: ["Showcase", "Portfolio", "Client"],
    url: "https://client-showcase-taupe.vercel.app"
  }
];

export default function WorkPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<number | null>(null);

  const categories = ['All', 'Architecture', 'Corporate Identity', 'Product Design'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js';
    script.async = true;
    script.onload = () => {
      const lenis = new window.Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });
      function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      (window as any).lenisInstance = lenis;
    };
    document.head.appendChild(script);
    return () => {
      if ((window as any).lenisInstance) (window as any).lenisInstance.destroy();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen]);

  const menuItems = [
    { id: 'home', text: 'Home', link: '/' },
    { id: 'work', text: 'Work', link: '/work' },
    { id: 'about', text: 'About', link: '/about' },
    { id: 'contact', text: 'Contact', link: '/contact' }
  ];

  const toDoubleStruck = (text: string): string => {
    const map: { [key: string]: string } = {
      'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾',
      'H': 'ℍ', 'I': '𝕀', 'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ',
      'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋', 'U': '𝕌',
      'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
      'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘',
      'h': '𝕙', 'i': '𝕚', 'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟',
      'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥', 'u': '𝕦',
      'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫', ' ': ' '
    };
    return text.split('').map(c => map[c] || c).join('');
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans overflow-x-hidden relative selection:bg-white selection:text-black">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans  { font-family: 'Inter', sans-serif; }
        .no-scroll  { overflow: hidden; }
        .ease-out-expo { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }

        /* Subtle dark grid */
        .dark-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Subtle grid */}
      <div className="fixed inset-0 dark-grid pointer-events-none z-0 opacity-100" />

      {/* ── Prisha-style navbar (dark crème) ── */}
      <div className="px-2 pt-2 md:px-3 md:pt-3 fixed top-0 w-full z-50">
        <nav className="fixed top-0 w-full p-6 z-50 transition-colors duration-500">
        <div className="flex justify-between items-center max-w-screen-2xl mx-auto px-2">
          <div className="border border-stone-900/20 rounded-lg px-4 py-3 backdrop-blur-md bg-[#F4F1EA]/50">
            <a href="/" className="uppercase tracking-[0.2em] text-sm font-bold text-stone-900">ENHANZERS</a>
          </div>
          <button
            className={`relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out bg-white/50 backdrop-blur-md border border-stone-900/20 w-12 h-12 hover:bg-white`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5 flex flex-col justify-center items-center">
              <span className={`absolute w-6 h-[1.5px] bg-stone-900 transition-all duration-400 ease-out ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute w-6 h-[1.5px] bg-stone-900 transition-all duration-400 ease-out ${isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} />
              <span className={`absolute w-6 h-[1.5px] bg-stone-900 transition-all duration-400 ease-out ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
            </div>
          </button>
        </div>
      </nav>
      </div>

      {/* Full-screen menu overlay */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-[#0a0a0a] transition-all duration-700 ease-in-out ${isMenuOpen ? 'opacity-98 translate-x-0' : 'opacity-0 -translate-x-full'}`} />
        <div className={`relative z-10 min-h-screen flex items-center md:items-start md:pt-36 justify-center md:justify-start px-8 md:px-16 transition-all duration-700 ease-in-out ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <div className="w-full max-w-2xl">
            <div className="flex flex-col gap-2 md:gap-4 w-full text-center md:text-left">
              {menuItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`transition-all duration-700 ease-out transform ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: isMenuOpen ? `${index * 100 + 200}ms` : '0ms' }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <a href={item.link} onClick={() => setIsMenuOpen(false)} className="block py-3">
                    <div className="relative overflow-hidden">
                      <div className={`transition-all duration-300 ${hoveredItem === item.id ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                        <span className="font-serif text-5xl md:text-6xl text-white">{item.text}</span>
                      </div>
                      <div className={`absolute inset-0 flex items-center justify-center md:justify-start transition-all duration-300 ${hoveredItem === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <span className="font-mono font-bold text-5xl md:text-6xl text-cyan-400">{toDoubleStruck(item.text)}</span>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            <p
              className={`mt-10 text-center md:text-left text-white/20 text-xs uppercase tracking-widest transition-all duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: isMenuOpen ? '800ms' : '0ms' }}
            >
              Navigate • Explore • Discover
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content (dark) ── */}
      <main className="relative z-10 pt-40 pb-0 px-6 md:px-12 lg:px-24 max-w-screen-2xl mx-auto">

        {/* Header */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/30 font-mono text-xs tracking-[0.3em] uppercase mb-6 block">Selected Works</span>
            <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-serif font-bold italic leading-none tracking-tight text-white">
              Portfolio.
            </h1>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap justify-between items-center gap-6 border-y border-white/10 py-8 mt-16">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-300 rounded-full border ${
                    filter === cat
                      ? 'bg-[#e8dcc8] text-[#0a0a0a] border-[#e8dcc8]'
                      : 'border-white/15 text-white/40 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Project Grid - All 7 projects with hover image swap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20 pb-32">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
                className="group relative cursor-pointer block"
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
              >
                {/* Image with hover swap */}
                <div className="overflow-hidden relative bg-white/5 aspect-[16/9] mb-8 rounded-sm">
                  <img
                    src={hoveredProjectId === project.id ? project.hoverImage : project.image}
                    alt={project.title}
                    className="object-cover w-full h-full opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out-expo"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-[#e8dcc8] text-[#0a0a0a] flex items-center justify-center transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out-expo shadow-xl">
                      <ArrowUpRight size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-2xl md:text-3xl font-serif font-medium group-hover:italic transition-all duration-300 text-white">
                      {project.title}
                    </h3>
                    <span className="font-mono text-xs text-white/30">{project.year}</span>
                  </div>
                  <p className="text-white/50 text-sm mb-6 font-sans tracking-wide leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase font-mono tracking-widest px-3 py-1.5 border border-white/10 text-white/30 rounded-sm group-hover:border-white/30 group-hover:text-white/60 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Fade-to-light CTA section ── */}
      <section className="relative z-10 overflow-hidden">
        {/* Gradient bridge: black → warm crème */}
        <div className="h-48 md:h-64 bg-gradient-to-b from-[#0a0a0a] to-[#e8e4db] pointer-events-none" />

        {/* Light CTA body */}
        <div className="bg-[#e8e4db] px-6 md:px-16 lg:px-24 pb-32">
          <div className="max-w-screen-2xl mx-auto flex flex-col items-center text-center">

            {/* Eyebrow */}
            <span className="font-mono text-xs tracking-[0.35em] uppercase text-stone-400 mb-10 block">
              Have a Vision?
            </span>

            {/* Huge serif headline */}
            <h2 className="font-serif italic font-bold text-[clamp(3rem,10vw,9rem)] leading-[0.92] tracking-tight text-stone-900 mb-12 max-w-5xl">
              Let's build something extraordinary.
            </h2>

            {/* Sub-copy */}
            <p className="text-stone-500 text-lg md:text-xl max-w-xl leading-relaxed mb-16 font-light">
              We partner with ambitious teams to craft digital experiences that leave a lasting impression. Your next chapter starts here.
            </p>

            {/* CTA button */}
            <a
              href="/contact"
              className="group inline-flex items-center gap-5 bg-stone-900 text-[#e8e4db] rounded-full px-12 py-5 text-sm font-semibold tracking-widest uppercase hover:bg-stone-700 transition-all duration-300 shadow-2xl hover:shadow-stone-900/30 hover:scale-105"
            >
              <span>Start a Conversation</span>
              <span className="w-8 h-8 rounded-full bg-[#e8dcc8]/20 flex items-center justify-center group-hover:bg-[#e8dcc8]/30 transition-colors">
                <ArrowUpRight size={16} strokeWidth={2} />
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}