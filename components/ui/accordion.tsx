'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItemPublicProps {
  value: string;
  title: string;
  children: React.ReactNode;
}

interface AccordionItemProps extends AccordionItemPublicProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ value, title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left hover:text-white transition-colors"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${value}`}
      >
        <span className="text-lg font-semibold text-white pr-8">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={20} className="text-text-secondary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`accordion-content-${value}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionComponent extends React.FC<AccordionProps> {
  Item: React.FC<AccordionItemPublicProps>;
}

const AccordionComponent: React.FC<AccordionProps> = ({ 
  type = 'single', 
  defaultValue,
  children,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    defaultValue ? new Set([defaultValue]) : new Set()
  );

  const handleToggle = (value: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        if (type === 'single') {
          newSet.clear();
        }
        newSet.add(value);
      }
      return newSet;
    });
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === AccordionItem) {
          const value = child.props.value;
          const isOpen = openItems.has(value);
          return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
            isOpen,
            onToggle: () => handleToggle(value),
          });
        }
        return child;
      })}
    </div>
  );
};

export const Accordion = AccordionComponent as AccordionComponent;
Accordion.Item = AccordionItem as React.FC<AccordionItemPublicProps>;

export default Accordion;

