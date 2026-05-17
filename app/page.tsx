'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowUpRight, Phone, Mail, MapPin, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Lenis Smooth Scroll types
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

];

export default function AgencySite() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Contact State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  // Handle smooth scrolling for on-page CTA buttons
  const handleMenuClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Initialize Lenis Smooth Scroll
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
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
      (window as any).lenisInstance = lenis;
    };

    document.head.appendChild(script);

    return () => {
      if ((window as any).lenisInstance) {
        (window as any).lenisInstance.destroy();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Three.js Logic: Section-Based Keyframes & Minimal Mouse Control
  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const MOUSE_SENSITIVITY = 0.0001; 

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.012);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 60); 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const mount = mountRef.current;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // --- DIGITAL WAVE (PARTICLES) ---
    const waveGroup = new THREE.Group();
    group.add(waveGroup);

    const AMOUNTX = 150;
    const AMOUNTY = 150;
    const SEPARATION = 1.6;
    const numParticles = AMOUNTX * AMOUNTY;

    // Wave 1 (Cyan)
    const positions1 = new Float32Array(numParticles * 3);
    let idx = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        let x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
        let z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
        let y = Math.sin(x * 0.02) * 5 + Math.cos(z * 0.02) * 5; 
        
        positions1[idx] = x;
        positions1[idx + 1] = y;
        positions1[idx + 2] = z;
        idx += 3;
      }
    }
    const geo1 = new THREE.BufferGeometry();
    geo1.setAttribute('position', new THREE.BufferAttribute(positions1, 3));
    const mat1 = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.18, transparent: true, opacity: 0.9 });
    const wave1 = new THREE.Points(geo1, mat1);
    waveGroup.add(wave1);

    // Wave 2 (Purple)
    const geo2 = new THREE.BufferGeometry();
    const positions2 = new Float32Array(numParticles * 3);
    for(let i=0; i<positions1.length; i++) positions2[i] = positions1[i];
    geo2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));
    const mat2 = new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.24, transparent: true, opacity: 0.6 });
    const wave2 = new THREE.Points(geo2, mat2);
    wave2.position.y = -2;
    waveGroup.add(wave2);

    // --- KEYFRAME ANIMATION SYSTEM ---
    const keyframes = [
      { rx: 1.2, ry: -0.5, rz: 0.8, px: 20, py: -10, pz: -20 },
      { rx: 0.8, ry: 0.6, rz: -0.4, px: -20, py: -5, pz: 0 },
      { rx: 1.5, ry: 0.1, rz: 0.1, px: 0, py: 15, pz: -10 },
      { rx: 1.8, ry: 0.0, rz: 0.0, px: 0, py: -20, pz: 30 }
    ];

    let mouseX = 0; let mouseY = 0;
    let targetMouseRotX = 0; let targetMouseRotY = 0;
    
    const windowHalfX = window.innerWidth / 2; 
    const windowHalfY = window.innerHeight / 2;
    const onDocumentMouseMove = (event: MouseEvent) => { 
      mouseX = (event.clientX - windowHalfX); 
      mouseY = (event.clientY - windowHalfY); 
    };
    document.addEventListener('mousemove', onDocumentMouseMove);

    let count = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const scrollY = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = Math.max(0, Math.min(1, totalHeight > 0 ? scrollY / totalHeight : 0));

      const numSections = keyframes.length - 1;
      const exactIndex = scrollPercent * numSections;
      const startIndex = Math.floor(exactIndex);
      const endIndex = Math.min(startIndex + 1, numSections);
      const lerpFactor = exactIndex - startIndex;

      const startFrame = keyframes[startIndex];
      const endFrame = keyframes[endIndex];

      const currentBaseRx = THREE.MathUtils.lerp(startFrame.rx, endFrame.rx, lerpFactor);
      const currentBaseRy = THREE.MathUtils.lerp(startFrame.ry, endFrame.ry, lerpFactor);
      const currentBaseRz = THREE.MathUtils.lerp(startFrame.rz, endFrame.rz, lerpFactor);
      const currentBasePx = THREE.MathUtils.lerp(startFrame.px, endFrame.px, lerpFactor);
      const currentBasePy = THREE.MathUtils.lerp(startFrame.py, endFrame.py, lerpFactor);
      const currentBasePz = THREE.MathUtils.lerp(startFrame.pz, endFrame.pz, lerpFactor);

      const pos1 = wave1.geometry.attributes.position.array as Float32Array;
      const pos2 = wave2.geometry.attributes.position.array as Float32Array;
      
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          pos1[i + 1] = (Math.sin((ix + count) * 0.3) * 2) + (Math.sin((iy + count) * 0.5) * 3);
          pos2[i + 1] = (Math.sin((ix + count * 0.8) * 0.2) * 4) + (Math.sin((iy + count * 0.9) * 0.4) * 4);
          i += 3;
        }
      }
      wave1.geometry.attributes.position.needsUpdate = true;
      wave2.geometry.attributes.position.needsUpdate = true;
      count += 0.02; 

      const targetOffsetX = mouseY * MOUSE_SENSITIVITY;
      const targetOffsetY = mouseX * MOUSE_SENSITIVITY;

      targetMouseRotX += (targetOffsetX - targetMouseRotX) * 0.05;
      targetMouseRotY += (targetOffsetY - targetMouseRotY) * 0.05;

      group.rotation.x = currentBaseRx + targetMouseRotX;
      group.rotation.y = currentBaseRy + targetMouseRotY;
      group.rotation.z = currentBaseRz;
      
      group.position.x = currentBasePx;
      group.position.y = currentBasePy;
      group.position.z = currentBasePz;

      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => { 
      camera.aspect = window.innerWidth / window.innerHeight; 
      camera.updateProjectionMatrix(); 
      renderer.setSize(window.innerWidth, window.innerHeight); 
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); 
      document.removeEventListener('mousemove', onDocumentMouseMove);
      cancelAnimationFrame(animationId);
      if (mount && renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      geo1.dispose(); mat1.dispose();
      geo2.dispose(); mat2.dispose();
      renderer.dispose();
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');
    setStatusType(null);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || '',
      message: formData.get('message') as string,
    };
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message');
      }
      
      setStatusType('success');
      setStatusMessage("Message sent successfully! We'll get back to you soon.");
      form.reset();
      
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again or contact us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  const featuredProjects = projects.filter(p => p.url).slice(0, 2);

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#050505] via-[#0a0a0a] to-[#000000] min-h-screen text-white font-sans overflow-x-hidden relative selection:bg-white selection:text-black">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600&family=Space+Grotesk:wght@400;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
        .custom-input { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: white; transition: all 0.3s ease; }
        .custom-input:focus { outline: none; border-color: #ffffff; background: rgba(0, 0, 0, 0.6); }
        .loader { border: 2px solid rgba(255,255,255,0.1); border-left-color: #ffffff; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* 3D Background */}
      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-80" />

      {/* Main Content */}
      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section id="home" className="min-h-screen relative flex flex-col justify-center px-6 md:px-24 lg:px-32 xl:px-48 pt-28 md:pt-20 pointer-events-none">
          <div className="max-w-4xl opacity-100 translate-y-0 pointer-events-auto">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-blue-400 mb-6 block">Welcome to Enhanzers</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-bold leading-[1.1] mb-6 md:mb-8 font-serif tracking-tight">
              Where vision <br />
              <span className="italic font-light text-gray-300">MEETS</span> precision.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl md:w-2/3 font-light leading-relaxed mb-12">
              We craft digital experiences that exist at the intersection of aesthetic beauty and engineering rigor. Your next chapter starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto">
              <button onClick={() => handleMenuClick('work')} className="w-full sm:w-auto justify-center px-6 py-4 md:px-8 bg-white text-black rounded-full hover:bg-gray-200 transition-all duration-300 uppercase text-xs tracking-[0.2em] font-bold flex items-center gap-3">
                View Projects
                <span className="bg-black/10 rounded-full p-1"><ArrowUpRight size={16} /></span>
              </button>
              <button onClick={() => handleMenuClick('contact')} className="w-full sm:w-auto justify-center px-6 py-4 md:px-8 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all duration-300 uppercase text-xs tracking-[0.2em] backdrop-blur-sm">
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section id="about" className="relative flex items-center px-6 md:px-24 lg:px-10 xl:px-48 py-10 md:py-24 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center pointer-events-auto">
            <div>
              <span className="font-mono text-xs tracking-[0.3em] uppercase text-purple-400 mb-6 block">Who We Are</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight mb-6 md:mb-8 font-serif">
                A development agency<br />
                focused on <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Excellence.</span>
              </h2>
            </div>
            <div className="space-y-8 text-gray-400 text-lg font-light leading-relaxed">
              <p>
                At Enhanzers, we believe that great software is built on a foundation of solid engineering and visionary design. Based in Chennai & Bengaluru, we partner with ambitious teams worldwide to transform complex challenges into elegant digital realities.
              </p>
              <p>
                Our multidisciplinary approach combines modern web technologies, immersive 3D experiences, and rigorous UX/UI architecture. We don't just build applications; we craft digital ecosystems that elevate your brand and drive meaningful engagement.
              </p>
              <div className="pt-4">
                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                  <div>
                    <div className="text-4xl font-serif text-white mb-2">05+</div>
                    <div className="text-xs uppercase tracking-widest font-mono text-gray-500">Digital Products</div>
                  </div>
                  <div>
                    <div className="text-4xl font-serif text-white mb-2">100%</div>
                    <div className="text-xs uppercase tracking-widest font-mono text-gray-500">Custom built</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PORTFOLIO SECTION (Fixed with High-Performance Crossfade) */}
        <section id="work" className="min-h-screen relative pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-12 lg:px-24 max-w-screen-2xl mx-auto">
          <header className="mb-16">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-cyan-400 mb-6 block">Selected Works</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] font-serif font-bold italic leading-none tracking-tight text-white mb-10 md:mb-16">
              Portfolio.
            </h2>
            <div className="flex flex-wrap gap-3 border-y border-white/10 py-0"></div>
          </header>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-20">
            <AnimatePresence mode="popLayout">
              {featuredProjects.map((project, index) => (
                <motion.a
                  key={project.id}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                  className="group relative cursor-pointer block"
                >
                  {/* ── Hardware-Accelerated CSS Crossfade ── */}
                  <div className="overflow-hidden relative bg-[#0a0a0a] aspect-[16/9] mb-8 rounded-sm">
                    
                    {/* Base Image */}
                    <img
                      src={project.image}
                      alt={project.title}
                      className="absolute inset-0 object-cover w-full h-full opacity-60 group-hover:opacity-0 transition-opacity duration-700 ease-in-out z-10 will-change-[opacity]"
                    />
                    
                    {/* Hover Image */}
                    <img
                      src={project.hoverImage}
                      alt={`${project.title} hover`}
                      className="absolute inset-0 object-cover w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out z-20 will-change-[opacity]"
                    />

                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-100 group-hover:opacity-0 transition-opacity duration-700 ease-in-out z-30" />
                    
                    {/* CTA Arrow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out flex items-center justify-center pointer-events-none z-40">
                      <div className="w-16 h-16 rounded-full bg-[#e8dcc8] text-[#0a0a0a] flex items-center justify-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) shadow-xl">
                        <ArrowUpRight size={24} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Text Elements */}
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

          <div className="mt-16 md:mt-24 flex justify-center">
            <Link href="/our-work" className="group inline-flex justify-center px-8 py-4 bg-transparent border border-white/30 text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 uppercase text-xs tracking-[0.2em] font-bold items-center gap-3 backdrop-blur-sm">
              View more of our work
              <span className="bg-white/10 group-hover:bg-black/10 rounded-full p-1 transition-colors"><ArrowUpRight size={16} /></span>
            </Link>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-24 py-20 md:py-24 bg-gradient-to-b from-transparent to-black/80">
          <div className="max-w-screen-xl mx-auto w-full">
            <div className="text-center mb-20">
              <span className="font-mono text-xs tracking-[0.3em] uppercase text-gray-500 mb-6 block">Get in Touch</span>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif tracking-tight mb-6">
                Let's build something <span className="italic font-light">extraordinary.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              
              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl transition-all duration-400 cursor-pointer"
                whileHover={{ y: -8, borderColor: "rgba(255, 255, 255, 0.3)", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h3 className="text-2xl font-bold mb-8 font-serif">Let's Work Together</h3>
                <p className="text-gray-400 mb-8">
                  Transforming ideas into digital reality. Based in Chennai & Bengaluru, serving clients worldwide.
                </p>
                
                <div className="space-y-6">
                  <a href="tel:+919080133878" className="flex items-center space-x-6 group">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 border border-white/10">
                      <Phone size={22} className="group-hover:text-black" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Phone</div>
                      <div className="text-lg text-gray-300 group-hover:text-white transition-colors">+91 90801 33878</div>
                    </div>
                  </a>

                  <a href="mailto:contact@enhanzers.com" className="flex items-center space-x-6 group">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 border border-white/10">
                      <Mail size={22} className="group-hover:text-black" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Email</div>
                      <div className="text-lg text-gray-300 group-hover:text-white transition-colors">contact@enhanzers.com</div>
                    </div>
                  </a>

                  <a href="mailto:yogesh@enhanzers.com" className="flex items-center space-x-6 group">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 border border-white/10">
                      <Mail size={22} className="group-hover:text-black" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Email (Alt)</div>
                      <div className="text-lg text-gray-300 group-hover:text-white transition-colors">yogesh@enhanzers.com</div>
                    </div>
                  </a>

                  <div className="flex items-center space-x-6 group pt-4 border-t border-white/10">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 border border-white/10">
                      <MapPin size={22} className="group-hover:text-black" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Location</div>
                      <div className="text-lg text-gray-300">Chennai & Bengaluru, India</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl transition-all duration-400"
                whileHover={{ y: -8, borderColor: "rgba(255, 255, 255, 0.3)", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h3 className="text-2xl font-bold mb-8 font-serif">Send a Message</h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-8">
                  <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                    <input type="text" name="website" tabIndex={-1} defaultValue="" autoComplete="off" />
                  </div>
                  
                  <div className="relative">
                    <input type="text" name="name" id="name" className="peer custom-input w-full px-5 py-4 rounded-xl placeholder-transparent focus:ring-0 font-light" placeholder="Enter name" required />
                    <label htmlFor="name" className="absolute left-5 -top-6 text-xs text-blue-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-blue-400 pointer-events-none font-mono tracking-wide">Your Name</label>
                  </div>
                  
                  <div className="relative mt-8">
                    <input type="email" name="email" id="email" className="peer custom-input w-full px-5 py-4 rounded-xl placeholder-transparent focus:ring-0 font-light" placeholder="Enter email" required />
                    <label htmlFor="email" className="absolute left-5 -top-6 text-xs text-blue-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-blue-400 pointer-events-none font-mono tracking-wide">Email Address</label>
                  </div>

                  <div className="relative mt-8">
                    <input type="tel" name="phone" id="phone" className="peer custom-input w-full px-5 py-4 rounded-xl placeholder-transparent focus:ring-0 font-light" placeholder="Enter phone (optional)" />
                    <label htmlFor="phone" className="absolute left-5 -top-6 text-xs text-blue-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-blue-400 pointer-events-none font-mono tracking-wide">Phone Number (Optional)</label>
                  </div>

                  <div className="relative mt-8">
                    <textarea name="message" id="message" rows={4} className="peer custom-input w-full px-5 py-4 rounded-xl placeholder-transparent focus:ring-0 font-light resize-none" placeholder="Message us" required></textarea>
                    <label htmlFor="message" className="absolute left-5 -top-6 text-xs text-blue-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-blue-400 pointer-events-none font-mono tracking-wide">Project Details</label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all duration-300 mt-4 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                  >
                    <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
                    {isLoading && <span className="loader"></span>}
                    {!isLoading && <Send size={16} />}
                  </button>

                  {statusMessage && (
                    <div className={`text-center text-sm mt-4 font-mono tracking-wide ${statusType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {statusMessage}
                    </div>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
          
          <footer className="absolute bottom-0 left-0 right-0 w-full text-center mt-32 border-t border-white/10 pt-8 text-gray-500 text-xs font-mono uppercase tracking-widest pb-8">
            &copy; {new Date().getFullYear()} ENHANZERS. All rights reserved.
          </footer>
        </section>
      </main>
    </div>
  );
}