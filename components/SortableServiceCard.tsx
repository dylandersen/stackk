import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ServiceCard from './ServiceCard';
import { Service } from '@/types';

interface SortableServiceCardProps {
  service: Service;
  onClick?: () => void;
  featured?: boolean;
}

const SortableServiceCard: React.FC<SortableServiceCardProps> = ({ service, onClick, featured = false }) => {
  const [wasDragging, setWasDragging] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: service.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  // Track if we were dragging to prevent click after drag
  React.useEffect(() => {
    if (isDragging) {
      setWasDragging(true);
    } else if (wasDragging) {
      // Reset after a short delay to allow click to be ignored
      const timer = setTimeout(() => setWasDragging(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isDragging, wasDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if we just finished dragging
    if (!wasDragging && !isDragging && onClick) {
      onClick();
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group"
      {...attributes}
      onClick={handleClick}
    >
      {/* Visual drag handle indicator - appears on hover */}
      <div
        className="absolute top-2 right-2 z-20 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-md border border-white/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          opacity: isDragging ? 1 : undefined,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-white"
        >
          <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="6" cy="2" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="10" cy="2" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="2" cy="6" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="10" cy="6" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="2" cy="10" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="6" cy="10" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.7" />
        </svg>
      </div>
      
      {/* Make the whole card draggable */}
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <ServiceCard service={service} featured={featured} />
      </div>
    </div>
  );
};

export default SortableServiceCard;
