import React from 'react';
import { motion } from 'motion/react';
import { ContactBuilder } from '../../components/ui/ContactBuilder';
import { SiteHeader } from '../../components/ui/SiteHeader';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  return (
    <motion.div
      className="contact-page-shell bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden flex flex-col"
      data-scroll-root
    >
      <SiteHeader />
      <div className="contact-page-content flex-1 min-h-0 w-full px-2 md:px-4 pt-[calc(var(--header-height)+var(--header-content-gap))] pb-12 md:pb-6 flex flex-col">
        <ContactBuilder />
      </div>
    </motion.div>
  );
};

export default ContactPage;
