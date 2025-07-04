import React from 'react';
import { motion } from 'framer-motion';
import { useI18nStore } from '../../stores/i18nStore';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Github,
  Mail,
  MapPin,
  Phone,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const { t } = useI18nStore();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-900 dark:hover:text-white' },
  ];

  const footerSections = [
    {
      title: t('footer.links.product.title'),
      links: [
        { name: t('footer.links.product.courses'), href: '/courses' },
        { name: t('footer.links.product.features'), href: '#features' },
        { name: t('footer.links.product.pricing'), href: '#pricing' },
        { name: t('footer.links.product.demo'), href: '#demo' },
      ],
    },
    {
      title: t('footer.links.company.title'),
      links: [
        { name: t('footer.links.company.about'), href: '#about' },
        { name: t('footer.links.company.careers'), href: '#careers' },
        { name: t('footer.links.company.contact'), href: '#contact' },
        { name: t('footer.links.company.blog'), href: '#blog' },
      ],
    },
    {
      title: t('footer.links.support.title'),
      links: [
        { name: t('footer.links.support.help'), href: '#help' },
        { name: t('footer.links.support.documentation'), href: '#docs' },
        { name: t('footer.links.support.community'), href: '#community' },
        { name: t('footer.links.support.status'), href: '#status' },
      ],
    },
    {
      title: t('footer.links.legal.title'),
      links: [
        { name: t('footer.links.legal.privacy'), href: '#privacy' },
        { name: t('footer.links.legal.terms'), href: '#terms' },
        { name: t('footer.links.legal.cookies'), href: '#cookies' },
      ],
    },
  ];

  const contactInfo = [
    { icon: Mail, text: 'contact@eduai.com', href: 'mailto:contact@eduai.com' },
    { icon: Phone, text: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
    { icon: MapPin, text: 'Paris, France', href: '#' },
  ];

  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* Logo */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <span className="text-xl font-bold">{t('footer.company.title')}</span>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('footer.company.description')}
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  {contactInfo.map((contact, index) => (
                    <a
                      key={index}
                      href={contact.href}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <contact.icon className="h-4 w-4 text-primary group-hover:text-accent transition-colors" />
                      <span className="text-sm">{contact.text}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (sectionIndex + 1) }}
                  viewport={{ once: true }}
                >
                  <h3 className="font-semibold text-foreground mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1 group"
                        >
                          {link.name}
                          {link.href.startsWith('http') && (
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/40 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-sm text-muted-foreground"
            >
              {t('footer.company.copyright')}
            </motion.p>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center gap-6"
            >
              <span className="text-sm text-muted-foreground mr-2">
                {t('footer.social.followUs')}:
              </span>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`text-muted-foreground transition-colors p-2 rounded-lg hover:bg-muted ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </footer>
  );
};

export default Footer;
