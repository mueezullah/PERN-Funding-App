import { Wallet, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-brand-dark text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative bg-brand-dark p-2 rounded-full ring-2 ring-brand ring-offset-2 ring-offset-slate-900">
                <Wallet className="w-5 h-5 text-brand" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Only<span className="text-brand">Funds</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering creators and entrepreneurs to turn their dreams into reality through transparent, trust-based crowdfunding.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-brand hover:text-white text-slate-300 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-brand hover:text-white text-slate-300 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-brand hover:text-white text-slate-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-brand hover:text-white text-slate-300 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#about" className="hover:text-brand transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#campaigns" className="hover:text-brand transition-colors">
                  Browse Campaigns
                </a>
              </li>
              <li>
                <a href="#home" className="hover:text-brand transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand transition-colors">
                  Community Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-brand transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand transition-colors">
                  Trust & Safety
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span className="text-slate-400">123 Innovation Street, Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand shrink-0" />
                <a href="mailto:hello@onlyfunds.com" className="text-slate-400 hover:text-brand transition-colors">
                  hello@onlyfunds.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand shrink-0" />
                <a href="tel:+1234567890" className="text-slate-400 hover:text-brand transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} OnlyFunds. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-brand transition-colors">
                Accessibility
              </a>
              <a href="#" className="hover:text-brand transition-colors">
                Sitemap
              </a>
              <a href="#" className="hover:text-brand transition-colors">
                Partners
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}