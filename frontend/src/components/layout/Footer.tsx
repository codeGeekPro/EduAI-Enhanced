import React from 'react';
import { useI18nStore } from '../../stores/i18nStore';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const { t } = useI18nStore();

  const footerSections = [
    {
      title: t('footer.product.title'),
      links: [
        { label: t('footer.product.courses'), href: '/courses' },
        { label: t('footer.product.progress'), href: '/progress' },
        { label: t('footer.product.features'), href: '#' },
        { label: t('footer.product.pricing'), href: '#' },
      ],
    },
    {
      title: t('footer.company.title'),
      links: [
        { label: t('footer.company.about'), href: '#' },
        { label: t('footer.company.careers'), href: '#' },
        { label: t('footer.company.press'), href: '#' },
        { label: t('footer.company.blog'), href: '#' },
      ],
    },
    {
      title: t('footer.resources.title'),
      links: [
        { label: t('footer.resources.help'), href: '#' },
        { label: t('footer.resources.faq'), href: '#' },
        { label: t('footer.resources.contact'), href: '#' },
        { label: t('footer.resources.community'), href: '#' },
      ],
    },
    {
        title: t('footer.legal.title'),
        links: [
            { label: t('footer.legal.privacy'), href: '#' },
            { label: t('footer.legal.terms'), href: '#' },
            { label: t('footer.legal.cookies'), href: '#' },
        ],
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'Github' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Contact' },
  ];

  return (
    <footer className="bg-card text-card-foreground border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="text-xl font-bold mb-2">EduAI</h3>
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} EduAI. {t('footer.rights')}
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
