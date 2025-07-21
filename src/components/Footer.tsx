import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold">Printa.ng</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Nigeria's premier printing and branding platform. Professional quality, 
              fast delivery, and exceptional service across Abuja and beyond.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Business Cards</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Car Branding</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Wedding Invitations</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Flyers & Brochures</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Custom Design</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Bulk Printing</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4 text-primary-foreground/80">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Plot 123, Ademola Adetokunbo Crescent</p>
                  <p>Wuse 2, Abuja, FCT</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <p>+234 803 123 4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <p>hello@printa.ng</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Mon - Sat: 8:00 AM - 8:00 PM</p>
                  <p>Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Get Started</h3>
            <div className="space-y-4">
              <p className="text-primary-foreground/80">
                Ready to bring your ideas to life? Start your order today!
              </p>
              <Button variant="secondary" className="w-full">
                Start Order Now
              </Button>
              <Button variant="outline" className="w-full bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Upload Design
              </Button>
              <div className="bg-primary-foreground/10 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1">WhatsApp Support</p>
                <p className="text-sm text-primary-foreground/80">+234 803 123 4567</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="border-t border-primary-foreground/20 pt-8 mb-8">
          <h4 className="text-lg font-semibold mb-4">Service Areas in Abuja</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-primary-foreground/80">
            <div>Wuse 2</div>
            <div>Garki</div>
            <div>Asokoro</div>
            <div>Maitama</div>
            <div>Gwarinpa</div>
            <div>Kubwa</div>
            <div>Central Area</div>
            <div>Utako</div>
            <div>Kado</div>
            <div>Life Camp</div>
            <div>Guzape</div>
            <div>Katampe</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/80 text-sm mb-4 md:mb-0">© 2025 Printa.ng. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-primary-foreground/80">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;