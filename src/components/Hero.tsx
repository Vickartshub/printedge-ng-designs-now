import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-subtle overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent"></div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 text-secondary" />
              <span>Free design for first 100 users</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Professional Printing & 
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Branding</span> in Abuja
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From business cards to car wraps, we deliver premium printing and branding solutions 
                with same-day service across Abuja. Upload your design or let our experts create one for you.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Same Day</p>
                  <p className="text-sm text-muted-foreground">Fast delivery</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">Premium Quality</p>
                  <p className="text-sm text-muted-foreground">Professional finish</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">24/7 Support</p>
                  <p className="text-sm text-muted-foreground">WhatsApp ready</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button variant="hero" size="xl" className="group">
                  Start Your Order
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="secondary" size="xl">
                Request Design
              </Button>
            </div>

            {/* Price Range */}
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Starting prices in Naira (₦)</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Business Cards:</span>
                  <span className="text-primary"> ₦2,500</span>
                </div>
                <div>
                  <span className="font-semibold">Flyers (A4):</span>
                  <span className="text-primary"> ₦150</span>
                </div>
                <div>
                  <span className="font-semibold">Car Branding:</span>
                  <span className="text-primary"> ₦75,000</span>
                </div>
                <div>
                  <span className="font-semibold">Wedding Invites:</span>
                  <span className="text-primary"> ₦450</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-up">
            <div className="relative">
              <img
                src={heroImage}
                alt="Professional printing and branding services in Abuja"
                className="rounded-2xl shadow-elegant w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-card border rounded-lg p-4 shadow-elegant animate-scale-in">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary fill-current" />
                </div>
                <div>
                  <p className="font-bold text-lg">500+</p>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-secondary text-secondary-foreground rounded-lg p-4 shadow-secondary animate-scale-in">
              <div className="text-center">
                <p className="font-bold text-lg">24hrs</p>
                <p className="text-sm">Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;