import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Palette, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import businessCards from "@/assets/business-cards.jpg";
import carBranding from "@/assets/car-branding.jpg";
import weddingInvites from "@/assets/wedding-invites.jpg";
import flyers from "@/assets/flyers.jpg";

const services = [
  {
    id: "business-cards",
    title: "Business Cards",
    description: "Premium business cards that make lasting impressions. Available in various finishes and sizes.",
    image: businessCards,
    price: "From ₦2,500",
    features: ["Matt/Gloss finish", "Multiple sizes", "Same day printing"],
    popular: true
  },
  {
    id: "car-branding",
    title: "Car Branding & Wraps",
    description: "Professional vehicle branding for businesses. Full wraps, partial graphics, and decals.",
    image: carBranding,
    price: "From ₦75,000",
    features: ["On-site installation", "Weather resistant", "5-year warranty"],
    popular: false
  },
  {
    id: "wedding-invites",
    title: "Wedding Invitations",
    description: "Elegant wedding invitations and stationery packages for your special day.",
    image: weddingInvites,
    price: "From ₦450",
    features: ["Custom design", "Premium paper", "RSVP cards included"],
    popular: false
  },
  {
    id: "flyers",
    title: "Flyers & Brochures",
    description: "Eye-catching marketing materials for events, promotions, and business advertising.",
    image: flyers,
    price: "From ₦150",
    features: ["A4/A5 sizes", "Bulk discounts", "Quick turnaround"],
    popular: true
  }
];

const FeaturedServices = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Our Featured <span className="text-primary">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From quick prints to comprehensive branding solutions, we've got everything you need 
            to make your business stand out in Abuja and beyond.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group bg-card border rounded-2xl overflow-hidden hover:shadow-elegant transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {service.popular && (
                  <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <span className="text-primary font-bold text-sm">
                    {service.price}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-xs text-muted-foreground flex items-center">
                      <div className="w-1 h-1 bg-primary rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to="/products">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Start Order
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-6 text-center hover:shadow-primary transition-all duration-300 transform hover:scale-105">
            <Upload className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Upload Design</h3>
            <p className="text-primary-foreground/80 mb-4">
              Have a ready design? Upload and get instant pricing.
            </p>
            <Button variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Upload Now
            </Button>
          </div>

          <div className="bg-gradient-secondary text-secondary-foreground rounded-2xl p-6 text-center hover:shadow-secondary transition-all duration-300 transform hover:scale-105">
            <Palette className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Request Design</h3>
            <p className="text-secondary-foreground/80 mb-4">
              Need help? Our designers will create something amazing.
            </p>
            <Button variant="outline" className="bg-transparent border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
              Get Design Help
            </Button>
          </div>

          <div className="bg-accent text-accent-foreground rounded-2xl p-6 text-center hover:shadow-elegant transition-all duration-300 transform hover:scale-105">
            <Truck className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Same Day Delivery</h3>
            <p className="text-accent-foreground/80 mb-4">
              Urgent order? We'll deliver within Abuja in 24 hours.
            </p>
            <Button variant="outline" className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent">
              Express Order
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;