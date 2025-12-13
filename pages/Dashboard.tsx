import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Wallet, ChevronRight } from 'lucide-react';
import StatDisplay from '../components/StatDisplay';
import ServiceCard from '../components/ServiceCard';
import { MOCK_SERVICES } from '../constants';
import { useNavigate } from 'react-router-dom';

const MotionDiv = motion.div as any;
const MotionSection = motion.section as any;

const Dashboard = () => {
  const navigate = useNavigate();
  // Feature OpenAI as it has usage metrics
  const featuredService = MOCK_SERVICES.find(s => s.name.includes('OpenAI')) || MOCK_SERVICES[0];
  const totalSpent = MOCK_SERVICES.reduce((acc, s) => acc + s.price + (s.usageCurrent && s.usageUnit === '$' ? s.usageCurrent : 0), 0);

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
    <MotionDiv 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex bg-surface rounded-full p-1 border border-border">
          <button className="px-4 py-2 bg-background rounded-full text-white text-sm font-medium shadow-sm">General</button>
          <button className="px-4 py-2 text-text-secondary hover:text-white text-sm font-medium transition-colors">By Project</button>
        </div>
        <button className="p-3 bg-surface hover:bg-surface-hover border border-border rounded-full text-text-secondary hover:text-primary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background"></span>
        </button>
      </header>

      {/* Hero Metric */}
      <MotionSection variants={itemVariants}>
        <StatDisplay 
          amount={totalSpent} 
          label="Total Spend (Feb)" 
          change={12} 
          large 
        />
      </MotionSection>

      {/* Featured Service */}
      <MotionSection variants={itemVariants} className="w-full">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-secondary font-medium">High Usage Alert</h2>
         </div>
         <ServiceCard 
           service={featuredService} 
           featured 
           onClick={() => navigate(`/services/${featuredService.id}`)}
         />
      </MotionSection>

      {/* Payment History */}
      <MotionSection variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-secondary font-medium">Recent Transactions</h2>
          <button className="text-sm text-primary hover:text-primary-hover font-medium">View All</button>
        </div>
        
        <div className="bg-surface border border-border rounded-card p-2 overflow-hidden">
          {[
             { name: 'Vercel Pro', date: 'Yesterday, 5:12 PM', amount: 20.00, logo: 'https://logo.clearbit.com/vercel.com' },
             { name: 'Cursor Subscription', date: '20 Feb, 1:38 PM', amount: 20.00, logo: 'https://logo.clearbit.com/cursor.sh' },
             { name: 'OpenAI Auto-Reload', date: '15 Feb, 8:17 AM', amount: 50.00, logo: 'https://logo.clearbit.com/openai.com' },
             { name: 'Namecheap Renewal', date: '12 Feb, 11:00 AM', amount: 12.98, logo: 'https://logo.clearbit.com/namecheap.com' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
               <div className="flex items-center gap-3">
                 <img src={item.logo} alt={item.name} className="w-10 h-10 rounded-full object-cover bg-white/10" />
                 <div>
                   <h4 className="font-bold text-white text-sm">{item.name}</h4>
                   <p className="text-text-secondary text-xs">{item.date}</p>
                 </div>
               </div>
               <div className="text-right">
                 <span className="block font-mono font-medium text-white">- ${item.amount.toFixed(2)}</span>
               </div>
            </div>
          ))}
        </div>
      </MotionSection>
    </MotionDiv>
  );
};

export default Dashboard;