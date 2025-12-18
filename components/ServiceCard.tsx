import React from 'react';
import { motion } from 'framer-motion';
import { Link2, CheckCircle2 } from 'lucide-react';
import { Service } from '@/types';

const MotionDiv = motion.div as any;

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
  featured?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, featured = false }) => {
  // Check if this is a connected API/OAuth service (Vercel, Supabase, etc.)
  const hasVercelToken = (service as any).vercelTokenHash;
  const hasSupabaseToken = (service as any).supabaseTokenHash || (service as any).supabaseRefreshTokenHash;
  const isApiConnected = service.connected && (hasVercelToken || hasSupabaseToken);
  
  // Get the last synced date for connected services
  const lastSyncedAt = (service as any).lastSyncedAt;
  
  // Format display date - prefer lastSyncedAt for connected services, otherwise use createdAt
  const displayDate = lastSyncedAt 
    ? new Date(lastSyncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : service.createdAt 
      ? new Date(service.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;
  
  const dateLabel = lastSyncedAt ? 'Synced' : 'Added';

  return (
    <MotionDiv
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-card p-5 cursor-pointer flex flex-col justify-between ${featured ? 'aspect-[3.03/1] md:aspect-[3.78/1]' : 'aspect-[2.27/1]'}`}
      style={{ backgroundColor: service.color }}
    >
      {/* Background noise texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {/* Top: Logo and Cost */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-2">
          {service.logo ? (
            <div className="bg-white rounded-xl p-1.5 shadow-lg">
              <img 
                src={service.logo} 
                alt={service.name} 
                className="w-6 h-6 md:w-8 md:h-8 object-contain rounded-lg"
                onError={(e) => {
                  // Hide image if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="bg-white/20 rounded-xl p-1.5 shadow-lg flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
              <span className="text-white font-bold text-xs md:text-sm">
                {service.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold font-mono text-sm md:text-base border border-white/10">
          {service.currency}{service.price}
          <span className="text-white/60 text-xs font-normal ml-1">/{service.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
        </span>
      </div>

      {/* Bottom: Name, Date, and Connection Badge */}
      <div className="relative z-10 mt-auto">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-primary font-bold text-xl md:text-2xl tracking-tight">{service.name}</h3>
            {displayDate && (
              <p className="text-white/60 text-xs mt-1">
                {dateLabel} {displayDate}
              </p>
            )}
          </div>
          
          {isApiConnected && (
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold font-mono text-sm md:text-base border border-white/10 flex items-center gap-2 shrink-0">
              <CheckCircle2 className="text-green-400 w-4 h-4 md:w-5 md:h-5" />
              <Link2 className="text-white/80 w-4 h-4 md:w-5 md:h-5" />
            </div>
          )}
        </div>
      </div>
    </MotionDiv>
  );
};

export default ServiceCard;