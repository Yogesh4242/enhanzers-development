'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { id: 'home', text: 'Home', href: '/' },
  { id: 'portfolio', text: 'Portfolio', href: '/our-work' },
  { id: 'about', text: 'About', href: '/#about' },
  { id: 'work', text: 'Work', href: '/#work' },
  { id: 'contact', text: 'Contact', href: '/#contact' }
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Smart navigation handler for cross-page anchoring & smooth scrolling
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    // Wait for the curtain animation to start closing before navigating
    setTimeout(() => {
      if (href.startsWith('/#')) {
        const targetId = href.replace('/#', '');
        if (pathname === '/') {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          router.push(href);
        }
      } else {
        router.push(href);
      }
    }, 400); 
  };

  return (
    <>
      {/* RECTANGULAR GLASSMORPHIC NAVBAR WITH SLIGHT CURVES */}
      <div className="fixed top-4 md:top-6 left-0 w-full z-[60] flex justify-center px-4 md:px-8 pointer-events-none">
        <nav className="pointer-events-auto flex justify-between items-center w-full max-w-screen-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 md:px-8 md:py-4 transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          
          {/* Brand Logo */}
          <a 
            href="/"
            onClick={(e) => handleNavigation(e, '/')}
            className="group cursor-pointer flex flex-col items-start overflow-hidden py-1"
          >
            <span className="uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-xs md:text-sm relative flex flex-col">
              <span className="transition-transform duration-500 ease-out transform group-hover:-translate-y-[150%] text-white">ENHANZERS</span>
              <span className="absolute inset-0 transition-transform duration-500 ease-out transform translate-y-[150%] group-hover:translate-y-0 text-cyan-400">ENHANZERS</span>
            </span>
          </a>

          {/* Classic Animated Hamburger Menu */}
          <button
            className={`relative flex items-center justify-center rounded-full transition-all duration-500 ease-out w-10 h-10 md:w-12 md:h-12 group`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Toggle menu"
          >
            {/* Subtle highlight effect on hover */}
            <div className="absolute inset-0 bg-white/0 rounded-full group-hover:bg-white/10 transition-colors duration-500"></div>
            
            <div className="relative w-5 h-4 md:w-6 md:h-5 flex flex-col justify-center items-center">
              <span className={`absolute w-5 md:w-6 h-[1.5px] transition-all duration-400 ease-out ${isMenuOpen ? 'bg-cyan-400 rotate-45' : 'bg-white -translate-y-1.5 md:-translate-y-1.5 group-hover:-translate-y-2'}`} />
              <span className={`absolute w-5 md:w-6 h-[1.5px] transition-all duration-400 ease-out ${isMenuOpen ? 'bg-cyan-400 opacity-0 scale-0' : 'bg-white opacity-100 scale-100'}`} />
              <span className={`absolute w-5 md:w-6 h-[1.5px] transition-all duration-400 ease-out ${isMenuOpen ? 'bg-cyan-400 -rotate-45' : 'bg-white translate-y-1.5 md:translate-y-1.5 group-hover:translate-y-2'}`} />
            </div>
          </button>

        </nav>
      </div>

      {/* Fullscreen Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-[#050505] transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] origin-top ${isMenuOpen ? 'scale-y-100' : 'scale-y-0'}`} />
        
        <div className={`relative z-10 min-h-screen flex flex-col pt-32 pb-12 md:pt-40 md:pb-16 px-6 md:px-12 lg:px-20 xl:px-32 max-w-screen-2xl mx-auto`}>
          
          {/* Main Links Container */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Reduced gap and adjusted padding to fix cramped feeling */}
            <div className="flex flex-col gap-4 md:gap-6 w-full text-left">
              {menuItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={`overflow-hidden transition-all duration-700 ease-out flex items-start ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: isMenuOpen ? `${index * 100 + 150}ms` : '0ms' }}
                >
                  <a 
                    href={item.href}
                    onClick={(e) => handleNavigation(e, item.href)} 
                    className="group relative block w-full text-left"
                  >
                    {/* Added pb-2 to prevent clipping of letters like 'p' or 'g' */}
                    <div className="relative overflow-hidden inline-block w-full pb-2">
                      {/* Default Text: Scaled down to 4xl/5xl/6xl */}
                      <span className="block font-sans font-light tracking-tight text-4xl md:text-5xl lg:text-6xl text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full leading-[1.2]">
                        {item.text}
                      </span>
                      {/* Hover Text */}
                      <span className="absolute inset-0 block font-serif italic text-4xl md:text-5xl lg:text-6xl text-cyan-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover:translate-y-0 leading-[1.2]">
                        {item.text}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          {/* Minimalist Agency Footer */}
          <div 
            className={`w-full mt-12 md:mt-16 transition-all duration-700 ease-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} 
            style={{ transitionDelay: isMenuOpen ? '600ms' : '0ms' }}
          >
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start text-white/50 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em]">
           
              <a href="mailto:contact@enhanzers.com" className="hover:text-cyan-400 transition-colors pointer-events-auto">
                contact@enhanzers.com
              </a>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <div className="flex gap-8">
                 <a href="tel:+919080133878" className="hover:text-cyan-400 transition-colors pointer-events-auto">
                +91 90801 33878
              </a>
                {/* <a href="#" className="hover:text-white transition-colors pointer-events-auto">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors pointer-events-auto">Twitter</a>
                <a href="#" className="hover:text-white transition-colors pointer-events-auto">Behance</a> */}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}