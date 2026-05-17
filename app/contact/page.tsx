'use client';

import { ArrowUpRight, Phone, Mail, MapPin, Send } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// --- UTILITIES & DATA ---
const doubleStruckMap: Record<string, string> = {
  // Assuming this is where your mapping lives
  'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 
};

// FIXED: Defensive check prevents the "split of undefined" crash
const toDoubleStruck = (text?: string) => {
  if (!text || typeof text !== 'string') return ''; 
  return text.split('').map(char => doubleStruckMap[char] || char).join('');
};

export default function EnhanzersAgency() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Sample menu items array format to avoid further mapping crashes
  const menuItems = [
    { id: 1, text: 'Work' },
    { id: 2, text: 'Agency' },
    { id: 3, text: 'Contact' }
  ];
  
  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- THREE.JS PARTICLE SYSTEM ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15; 
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Material
    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 3;

    // Interaction Variables
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = window.scrollY;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Base constant rotation
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.001;

      // 3D Perception Logic
      const scrollInfluence = scrollY * 0.0005; 
      particlesMesh.rotation.y += 0.05 * (mouseX - particlesMesh.rotation.y * 0.1);
      particlesMesh.rotation.x += 0.05 * ((mouseY + scrollInfluence) - particlesMesh.rotation.x * 0.1);

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      particlesGeometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // --- FORM HANDLING ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');
    setStatusType(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('contact.php', {
        method: 'POST',
        body: formData,
      });

      // Handle potential non-JSON responses gracefully
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
         const data = await response.json();
         if (!response.ok || !data.success) {
           throw new Error(data.message || 'Mail failed');
         }
      } else {
         if (!response.ok) throw new Error('Network response was not ok.');
      }

      setStatusType('success');
      setStatusMessage("Message sent successfully! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      setStatusType('error');
      // TS Fix: Safely handle unknown error types
      setStatusMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
            font-family: 'Space Grotesk', sans-serif;
            background-color: #050505;
            color: #ffffff;
            overflow-x: hidden;
            cursor: auto; 
            overflow-y: auto;
        }
        #canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6; 
            pointer-events: none;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border-color: rgba(255, 255, 255, 0.3);
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
            animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            opacity: 0;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.5s; }
        .delay-4 { animation-delay: 0.7s; }
        .custom-input {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            transition: all 0.3s ease;
        }
        .custom-input:focus {
            outline: none;
            border-color: #ffffff;
            background: rgba(0, 0, 0, 0.6);
        }
        .loader {
            border: 2px solid rgba(255,255,255,0.1);
            border-left-color: #ffffff;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />

      {/* 3D Background Container */}
      <div id="canvas-container" ref={mountRef}></div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 antialiased selection:bg-white selection:text-black">
        
        {/* Brand Header */}
        <div className="text-center mb-16 w-full max-w-4xl pt-20">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 animate-in delay-1 uppercase">
            Enhanzers
          </h1>
          <p className="text-lg md:text-xl text-gray-400 tracking-[0.2em] uppercase animate-in delay-2">
            A Development Agency
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          
          {/* Left Column: Contact Info */}
          <div className="space-y-6 animate-in delay-3">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Let's Work Together</h2>
              <p className="text-gray-400">
                Transforming ideas into digital reality. 
              </p>
              <p className="text-gray-400 mb-8">
                Based in Chennai & Bengaluru, serving clients worldwide. 
              </p>
              
              <div className="space-y-4">
                {/* Phone */}
                <a href="tel:+919080133878" className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Phone size={22} className="group-hover:text-black" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Phone</div>
                    <div className="text-lg font-medium">+91 90801 33878</div>
                  </div>
                </a>

                {/* Email 1 */}
                <a href="mailto:contact@enhanzers.com" className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Mail size={22} className="group-hover:text-black" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Email</div>
                    <div className="text-lg font-medium">contact@enhanzers.com</div>
                  </div>
                </a>

                {/* Email 2 */}
                <a href="mailto:yogesh@enhanzers.com" className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Mail size={22} className="group-hover:text-black" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Email (Alt)</div>
                    <div className="text-lg font-medium">yogesh@enhanzers.com</div>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <MapPin size={22} className="group-hover:text-black" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Location</div>
                    <div className="text-lg font-medium">Chennai, India</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="glass-card p-8 rounded-2xl animate-in delay-4 flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-8 border-b border-white/10 pb-4">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* HONEYPOT FIELD (Anti-Bot) */}
              <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                <input type="text" name="website" tabIndex={-1} defaultValue="" autoComplete="off" />
              </div>
              
              <div className="relative">
                <input type="text" name="name" id="name" className="peer custom-input w-full px-4 py-3 rounded-lg placeholder-transparent focus:ring-0" placeholder="Enter name" required />
                <label htmlFor="name" className="absolute left-4 -top-6 text-xs text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-white pointer-events-none">Enter name</label>
              </div>
              
              <div className="relative">
                <input type="email" name="email" id="email" className="peer custom-input w-full px-4 py-3 rounded-lg placeholder-transparent focus:ring-0" placeholder="Enter email" required />
                <label htmlFor="email" className="absolute left-4 -top-6 text-xs text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-white pointer-events-none">Enter email</label>
              </div>

              <div className="relative">
                <textarea name="message" id="message" rows={4} className="peer custom-input w-full px-4 py-3 rounded-lg placeholder-transparent focus:ring-0" placeholder="Message us" required></textarea>
                <label htmlFor="message" className="absolute left-4 -top-6 text-xs text-white transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-white pointer-events-none">Message us</label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'SENDING...' : 'SEND MESSAGE'}</span>
                {isLoading && <span className="loader"></span>}
              </button>

              {statusMessage && (
                <div className={`text-center text-sm mt-3 block ${statusType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {statusMessage}
                </div>
              )}
            </form>
          </div>
        </div>

        <footer className="mt-20 text-gray-600 text-sm animate-in delay-4">
          &copy; {new Date().getFullYear()} ENHANZERS. All rights reserved.
        </footer>
      </main>
    </>
  );
}