'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  Wallet, ArrowRight, Terminal, PlayCircle, BarChart2, 
  ShieldCheck, Zap, GitBranch, Activity, Code2, 
  AlertTriangle, LayoutGrid, Layers, Bell, Settings,
  Plus, ChevronRight, Github, Twitter, Linkedin
} from 'lucide-react';

const MotionDiv = motion.div;
const MotionSection = motion.section;

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // Flashlight effect for cards
  useEffect(() => {
    const cards = document.querySelectorAll('.flashlight-card');
    
    const handleMouseMove = (e: MouseEvent) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 z-[-1] bg-background" />
      <div className="fixed inset-0 z-[-1] bg-grid pointer-events-none opacity-15" />
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Wallet size={20} strokeWidth={2} />
            </div>
            <span className="font-secondary font-semibold text-xl tracking-tight text-white">Stackk</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:block text-sm font-medium text-text-secondary hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/services/add" className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200" />
              <div className="relative flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                <span>Get Started</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-32 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6" ref={heroRef}>
          <MotionDiv
            style={{ opacity, scale }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/5 text-xs font-mono text-primary mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Track all your dev tools in one place
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-primary font-black tracking-tight leading-[1.1] mb-6 text-white"
            >
              Track your subscriptions.<br />
              <span className="text-gradient-primary">Never miss a payment.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              The developer-first platform for tracking subscriptions, monitoring usage, and managing all your dev tool spending in one beautiful dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                href="/services/add"
                className="flex items-center justify-center gap-2 bg-white text-background px-8 py-4 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
              >
                <Terminal size={18} />
                Start Tracking
              </Link>
              <button className="flex items-center justify-center gap-2 bg-surface border border-border text-text-secondary hover:text-white hover:border-white/20 px-8 py-4 rounded-xl font-semibold text-sm transition-all">
                <PlayCircle size={18} />
                Watch Demo
              </button>
            </motion.div>
          </MotionDiv>

          {/* App Interface Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-6xl mx-auto perspective-[2000px] group"
          >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full opacity-50" />

            <div className="relative bg-[#0A0A0B] border border-border rounded-2xl shadow-2xl overflow-hidden transform group-hover:rotate-x-2 transition-transform duration-700 ease-out h-[600px] md:h-[700px] flex">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-64 border-r border-border bg-surface/50 backdrop-blur-xl p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                    <Wallet size={14} className="text-white" />
                  </div>
                  <span className="font-secondary text-sm font-semibold">Stackk</span>
                </div>

                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                    <LayoutGrid size={18} />
                    Dashboard
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                    <Layers size={18} />
                    Services
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                    <Bell size={18} />
                    Alerts
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                    <Settings size={18} />
                    Settings
                  </button>
                </div>

                <div className="mt-auto">
                  <div className="p-3 rounded-xl bg-surface border border-white/5 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-text-secondary font-mono">Total Spend</span>
                      <span className="text-xs text-white font-mono">$142.20</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-yellow-500 w-[65%]" />
                    </div>
                  </div>
                  <button className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Add Service
                  </button>
                </div>
              </div>

              {/* Main Dashboard Area */}
              <div className="flex-1 flex flex-col bg-background/50 relative overflow-hidden">
                <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface/30 backdrop-blur-sm">
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="hover:text-white cursor-pointer">All Services</span>
                    <ChevronRight size={16} />
                    <span className="text-white">February 2024</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                      <Bell size={20} className="text-text-secondary hover:text-white cursor-pointer" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10" />
                  </div>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 rounded-2xl bg-surface border border-border group hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                          <Activity size={20} />
                        </div>
                        <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12%</span>
                      </div>
                      <div className="text-text-secondary text-sm font-medium mb-1">Total Spend</div>
                      <div className="text-3xl font-mono font-bold text-white">$142.20</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface border border-border group hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Code2 size={20} />
                        </div>
                        <span className="text-xs font-mono text-text-secondary bg-white/5 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="text-text-secondary text-sm font-medium mb-1">Services</div>
                      <div className="text-3xl font-mono font-bold text-white">9</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface border border-border group hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                          <AlertTriangle size={20} />
                        </div>
                        <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">Review</span>
                      </div>
                      <div className="text-text-secondary text-sm font-medium mb-1">Upcoming</div>
                      <div className="text-3xl font-mono font-bold text-white">3</div>
                    </div>
                  </div>

                  {/* Service Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Vercel Pro', price: '$20', color: '#000000', usage: '85/100 GB' },
                      { name: 'OpenAI API', price: '$84.20', color: '#10A37F', usage: '84.20/120 $' },
                      { name: 'Supabase', price: '$25', color: '#3ECF8E', usage: '6.2/8 GB' },
                    ].map((service, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl border border-border bg-surface hover:bg-surface-hover transition-colors cursor-pointer group"
                        style={{ borderColor: `${service.color}40` }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: service.color }}>
                            {service.name[0]}
                          </div>
                          <span className="text-sm font-mono font-semibold text-white">{service.price}</span>
                        </div>
                        <h4 className="text-white font-semibold mb-1">{service.name}</h4>
                        <div className="text-xs text-text-secondary mb-2">Usage: {service.usage}</div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ backgroundColor: service.color, width: '75%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Bar */}
              <div className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur border-t border-border flex justify-around items-center px-4">
                <LayoutGrid size={24} className="text-primary" />
                <Layers size={24} className="text-text-secondary" />
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center -mt-6 border-4 border-[#0A0A0B] shadow-lg shadow-primary/20">
                  <Plus size={24} className="text-white" />
                </div>
                <Bell size={24} className="text-text-secondary" />
                <Settings size={24} className="text-text-secondary" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <MotionSection
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-7xl mx-auto px-6 mt-32"
          id="features"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-primary font-bold text-center mb-16"
          >
            Everything you need to <span className="text-gradient-primary">manage subscriptions</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart2,
                title: 'Spend Analytics',
                description: 'Track spending across all your services. Get insights on usage patterns and optimize your tool budget.',
                tags: ['Analytics', 'Budget'],
                iconColor: 'text-primary'
              },
              {
                icon: ShieldCheck,
                title: 'Usage Monitoring',
                description: 'Automated alerts when you approach limits. Never get caught off guard by unexpected charges.',
                tags: ['Alerts', 'Monitoring'],
                iconColor: 'text-green-500'
              },
              {
                icon: Zap,
                title: 'Quick Actions',
                description: 'Add, pause, or cancel subscriptions in seconds. Manage all your tools from one dashboard.',
                tags: ['Fast', 'Simple'],
                iconColor: 'text-yellow-500'
              },
            ].map((feature, i) => (
              <MotionDiv
                key={i}
                variants={itemVariants}
                className="flashlight-card p-8 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={24} className={feature.iconColor} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
                <div className="flex gap-2">
                  {feature.tags.map((tag, j) => (
                    <span key={j} className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </MotionDiv>
            ))}
          </div>
        </MotionSection>

        {/* Integrations Section */}
        <div className="max-w-7xl mx-auto px-6 mt-32" id="integrations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] md:h-[500px]">
            <div className="md:col-span-2 flashlight-card p-0 relative group">
              <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
              <div className="p-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-primary text-xs font-mono mb-4">
                  <GitBranch size={12} />
                  Integrations
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Your Services</h3>
                <p className="text-text-secondary max-w-sm">
                  Link your accounts and automatically track subscriptions, usage, and payments from popular dev tools.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-tl from-surface-hover to-transparent rounded-tl-[100px] border-t border-l border-white/5 flex items-end justify-end p-8">
                  <div className="w-full h-48 bg-[#0A0A0B] rounded-xl border border-border p-4 font-mono text-xs text-gray-500 shadow-2xl translate-y-4 translate-x-4 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500">
                    <div className="flex gap-1.5 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                    <p><span className="text-purple-400">const</span> services = <span className="text-yellow-300">await</span> connect();</p>
                    <p><span className="text-purple-400">if</span> (services.length {'>'} 0) {'{'}</p>
                    <p className="pl-4">track(<span className="text-green-400">'all'</span>);</p>
                    <p>{'}'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flashlight-card p-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
              <div className="p-8">
                <h3 className="text-xl font-bold text-white mb-2">Mobile Ready</h3>
                <p className="text-text-secondary text-xs">Manage subscriptions on the go.</p>
              </div>
              <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-32 h-64 bg-[#0A0A0B] border border-border rounded-t-3xl shadow-2xl p-2">
                <div className="w-full h-full bg-surface rounded-t-2xl overflow-hidden relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" />
                  <div className="mt-8 px-2 space-y-2">
                    <div className="h-8 bg-white/5 rounded w-full" />
                    <div className="h-16 bg-primary/10 rounded w-full border border-primary/20" />
                    <div className="h-8 bg-white/5 rounded w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto px-6 mt-32 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-primary font-black text-white mb-8"
          >
            Ready to take control of your <br />
            <span className="text-gradient-primary">developer subscriptions?</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/services/add"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all w-full sm:w-auto"
            >
              Get Started for Free
            </Link>
            <div className="text-text-secondary text-sm font-mono">
              <span className="text-primary">{'>'}</span> Track your first service
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050506]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white">
                  <Wallet size={12} />
                </div>
                <span className="font-secondary font-bold text-white">Stackk</span>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed max-w-[150px]">
                The developer-first platform for subscription management.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#integrations" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><Link href="/services" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-secondary font-mono">© 2024 Stackk. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-text-secondary hover:text-white transition-colors">
                <Github size={16} />
              </a>
              <a href="#" className="text-text-secondary hover:text-white transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-text-secondary hover:text-white transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

