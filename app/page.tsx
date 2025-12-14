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

  // Card carousel state
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  
  const metricCards = [
    {
      title: 'Total Spend (Jan)',
      value: '$142.20',
      subtitle: 'Budget: $200.00',
      change: '+12%',
      reset: 'Resets Feb 1',
      progress: 71,
      bg: 'from-violet-600 to-purple-600',
      stackColors: ['from-blue-500 to-cyan-500', 'from-indigo-500 to-violet-500']
    },
    {
      title: 'Supabase Database',
      value: '24.8 GB',
      subtitle: 'Limit: 50 GB storage',
      change: '48%',
      reset: 'Resets in 12d',
      progress: 48,
      bg: 'from-[#3ECF8E] to-emerald-500',
      stackColors: ['from-teal-500 to-cyan-500', 'from-blue-500 to-indigo-500']
    },
    {
      title: 'Claude API Usage',
      value: '2.4M tokens',
      subtitle: 'Limit: 5M tokens/month',
      change: '+18%',
      reset: 'Resets in 5d',
      progress: 48,
      bg: 'from-[#D97757] to-orange-500',
      stackColors: ['from-amber-500 to-orange-600', 'from-red-500 to-pink-500']
    },
    {
      title: 'Vercel Bandwidth',
      value: '1.2 TB',
      subtitle: 'Limit: 2 TB/month',
      change: '60%',
      reset: 'Resets in 8d',
      progress: 60,
      bg: 'from-slate-700 via-gray-800 to-black',
      stackColors: ['from-gray-600 to-slate-700', 'from-zinc-700 to-gray-800']
    },
    {
      title: 'Vercel Function Invocations',
      value: '850K',
      subtitle: 'Limit: 1M invocations',
      change: '85%',
      reset: 'Resets in 8d',
      progress: 85,
      bg: 'from-gray-600 via-slate-700 to-black',
      stackColors: ['from-slate-600 to-gray-700', 'from-zinc-600 to-slate-700']
    },
  ];

  // Cycle through cards every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % metricCards.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [metricCards.length]);

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
            <Link href="/dashboard" className="hidden md:block text-sm font-medium text-text-secondary hover:text-white transition-colors">
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

          {/* macOS Desktop App Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-6xl mx-auto perspective-[2000px] group"
          >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full opacity-50" />

            <div className="relative bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden transform group-hover:scale-[1.01] transition-transform duration-700 ease-out h-[700px] flex flex-col">
              {/* macOS Window Chrome */}
              <div className="h-8 bg-surface border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-text-secondary text-xs font-body">Stackk</span>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-48 border-r border-border bg-surface flex flex-col">
                  <div className="px-4 py-5 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Wallet size={16} className="text-primary" />
                      </div>
                      <span className="font-secondary font-bold text-base text-white tracking-wide">Stackk</span>
                    </div>
                  </div>

                  <nav className="flex-1 p-3 space-y-1">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-[11px] font-secondary font-medium tracking-wide">
                      <LayoutGrid size={14} />
                      Dashboard
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-[11px] font-secondary font-medium tracking-wide">
                      <Layers size={14} />
                      Services
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-[11px] font-secondary font-medium tracking-wide">
                      <Bell size={14} />
                      Alerts
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-[11px] font-secondary font-medium tracking-wide">
                      <Settings size={14} />
                      Settings
                    </button>
                  </nav>

                  <div className="p-3 border-t border-border">
                    <button className="w-full bg-primary hover:bg-primary-hover text-white text-[11px] font-secondary font-semibold px-3 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 tracking-wide">
                      <Plus size={12} />
                      Add Service
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-background/50 overflow-hidden">
                  {/* Top Bar */}
                  <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-text-secondary text-xs font-secondary hover:text-white cursor-pointer">All Services</span>
                      <ChevronRight size={14} className="text-text-secondary" />
                      <span className="text-white text-xs font-body font-bold">January 2026</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
                        <Bell size={18} className="text-text-secondary hover:text-white cursor-pointer" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10"></div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                    {/* Header with Tabs */}
                    <div className="flex justify-between items-center">
                      <div className="flex bg-surface rounded-full p-1 border border-border">
                        <button className="px-4 py-1.5 bg-background rounded-full text-white text-xs font-body font-medium shadow-sm">General</button>
                        <button className="px-4 py-1.5 text-text-secondary hover:text-white text-xs font-body transition-colors">By Project</button>
                      </div>
                    </div>

                    {/* Stacked Cards Layout - Better Space Usage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Animated Metric Card Carousel with Wallet Stack Effect */}
                      <div className="relative h-full min-h-[140px] group cursor-pointer overflow-hidden">
                        {metricCards.map((card, index) => {
                          const isActive = index === currentCardIndex;
                          const offset = index - currentCardIndex;
                          
                          return (
                            <motion.div
                              key={index}
                              initial={false}
                              animate={{
                                opacity: isActive ? 1 : 0,
                                scale: isActive ? 1 : 0.95,
                                zIndex: isActive ? 20 : 0,
                              }}
                              transition={{ duration: 0.5, ease: 'easeInOut' }}
                              className="absolute inset-0"
                            >
                              {/* Stacked Card 2 */}
                              <div className={`absolute top-0 left-0 right-0 h-full bg-gradient-to-r ${card.stackColors[0]} rounded-xl transform scale-[0.92] translate-y-[-12px] opacity-60 z-0 transition-transform group-hover:translate-y-[-16px]`}></div>
                              {/* Stacked Card 1 */}
                              <div className={`absolute top-0 left-0 right-0 h-full bg-gradient-to-r ${card.stackColors[1]} rounded-xl transform scale-[0.96] translate-y-[-6px] opacity-80 z-10 transition-transform group-hover:translate-y-[-8px]`}></div>
                              
                              {/* Main Metric Card */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} rounded-xl p-5 shadow-lg overflow-hidden z-20 transition-transform hover:shadow-xl`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-white/20 transition-all"></div>
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="text-white/90 text-[10px] font-mono uppercase tracking-wider mb-1">{card.title}</div>
                                      <div className="text-4xl font-mono font-bold text-white tracking-tighter">{card.value}</div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur rounded px-1.5 py-0.5 text-white text-[10px] font-mono font-bold">{card.change}</div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between items-end mb-2">
                                      <div className="text-white/80 text-[10px] font-mono">{card.subtitle}</div>
                                      <div className="text-white text-[10px] font-mono opacity-80">{card.reset}</div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                      <motion.div 
                                        className="h-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: isActive ? `${card.progress}%` : 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                      ></motion.div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Stacked Alert Cards */}
                      <div className="relative h-full min-h-[140px]">
                        {/* Back Card 2 */}
                        <div className="absolute top-0 left-0 right-0 h-full bg-surface border border-border rounded-xl transform scale-[0.92] translate-y-[-16px] opacity-40 z-0"></div>
                        {/* Back Card 1 */}
                        <div className="absolute top-0 left-0 right-0 h-full bg-surface border border-border rounded-xl transform scale-[0.96] translate-y-[-8px] opacity-70 z-10"></div>
                        
                        {/* Main Alert Card */}
                        <div className="absolute inset-0 bg-surface border border-border rounded-xl p-5 shadow-xl z-20 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                                <AlertTriangle size={20} />
                              </div>
                              <div>
                                <h3 className="text-white font-secondary font-bold text-sm">Projected Overage</h3>
                                <p className="text-text-secondary text-xs font-body mt-1 leading-relaxed">
                                  Vercel usage at 90%. Limit in ~2 days.
                                </p>
                              </div>
                            </div>
                            <span className="bg-orange-500/20 text-orange-500 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-orange-500/20">Action Required</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button className="flex-1 bg-white text-background text-xs font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors">Check Usage</button>
                            <button className="flex-1 bg-surface-hover text-text-secondary text-xs font-bold py-2 rounded-lg hover:text-white transition-colors">Dismiss</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Services Grid - Apple Wallet Style */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-secondary font-semibold text-lg">Active Services</h2>
                        <button className="text-primary text-xs font-body font-medium hover:underline">View All</button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { 
                            name: 'Claude API', 
                            category: 'AI Models',
                            price: '$84.20',
                            limit: '$120.00 limit',
                            usage: 70,
                            color: '#D97757', // Terracotta
                            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Claude_AI_symbol.svg/1024px-Claude_AI_symbol.svg.png',
                            bg: 'bg-[#D97757]'
                          },
                          { 
                            name: 'Vercel Pro', 
                            category: 'Hosting',
                            price: '$20.00',
                            limit: '100 GB',
                            usage: 85,
                            color: '#000000',
                            critical: true,
                            logo: 'https://www.svgrepo.com/show/354513/vercel-icon.svg',
                            bg: 'bg-black'
                          },
                          { 
                            name: 'Supabase', 
                            category: 'Backend',
                            price: '$25.00',
                            limit: '8 GB',
                            usage: 78,
                            color: '#3ECF8E',
                            logo: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/supabase.webp',
                            bg: 'bg-[#3ECF8E]'
                          },
                        ].map((service, i) => (
                          <div
                            key={i}
                            className={`relative overflow-hidden rounded-xl h-[180px] flex flex-col justify-between p-5 cursor-pointer group transition-transform hover:scale-[1.02] hover:shadow-xl ${service.bg}`}
                          >
                            {/* Pass Texture/Noise */}
                            <div className="absolute inset-0 opacity-10 bg-white mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, white 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                            
                            {/* Glass Glare */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-[40px] rounded-full pointer-events-none"></div>

                            <div className="relative z-10 flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2.5 shadow-sm overflow-hidden">
                                  <img src={service.logo} alt={service.name} className="w-5 h-5 object-contain" />
                                </div>
                                <div>
                                  <div className="text-white font-secondary font-bold text-sm leading-tight">{service.name}</div>
                                  <div className="text-white/70 text-[10px] font-mono uppercase tracking-wider">{service.category}</div>
                                </div>
                              </div>
                              {service.critical && (
                                <div className="bg-red-500/90 backdrop-blur px-2 py-0.5 rounded-full border border-red-400/50 flex items-center gap-1 shadow-lg">
                                  <AlertTriangle size={10} className="text-white" />
                                  <span className="text-white text-[9px] font-bold uppercase tracking-wide">Critical</span>
                                </div>
                              )}
                            </div>

                            <div className="relative z-10">
                              <div className="flex justify-between items-end mb-2">
                                <div>
                                  <div className="text-white/80 text-[10px] font-secondary uppercase tracking-widest mb-0.5">Current Spend</div>
                                  <div className="text-white font-mono font-bold text-2xl tracking-tighter">{service.price}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-white/80 text-[10px] font-mono">{service.usage}%</div>
                                </div>
                              </div>
                              
                              {/* Progress Bar resembling a pass barcode/strip */}
                              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div 
                                  className="h-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                  style={{ width: `${service.usage}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1.5">
                                <span className="text-white/60 text-[10px] font-mono">{service.limit}</span>
                                <span className="text-white/60 text-[10px] font-mono">Resets in 4d</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-secondary font-semibold text-lg">Recent Transactions</h2>
                        <button className="text-primary text-sm font-body font-medium hover:underline">View All</button>
                      </div>
                      <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        {[
                          { name: 'Vercel Pro', date: 'Yesterday, 5:12 PM', amount: 20.00 },
                          { name: 'Cursor Subscription', date: '20 Feb, 1:38 PM', amount: 20.00 },
                          { name: 'OpenAI Auto-Reload', date: '15 Feb, 8:17 AM', amount: 50.00 },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-border last:border-b-0">
                            <div>
                              <h4 className="font-body font-semibold text-white text-sm mb-1">{item.name}</h4>
                              <p className="text-text-secondary text-xs font-body">{item.date}</p>
                            </div>
                            <div className="text-right">
                              <span className="block font-mono font-semibold text-white">${item.amount.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
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
