import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Tunde Adebayo",
    role: "Startup Founder",
    location: "Gwarinpa, Abuja",
    content: "PrintEdge.ng saved our product launch! We needed 1000 business cards and flyers in 6 hours. They delivered exceptional quality on time. Their design team understood our brand perfectly.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Ngozi Okwu",
    role: "Wedding Planner",
    location: "Asokoro, Abuja",
    content: "The wedding invitation designs are absolutely beautiful! PrintEdge.ng handled our client's traditional Nigerian wedding theme perfectly. The quality exceeded expectations and delivery was prompt.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Mr. Bello Hassan",
    role: "Car Dealer",
    location: "Garki, Abuja",
    content: "The car branding service is top-notch! They came to my location and wrapped 3 vehicles with professional graphics. My sales have increased significantly since the rebranding.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Sarah Okafor",
    role: "E-commerce Entrepreneur",
    location: "Wuse 2, Abuja",
    content: "PrintEdge.ng handles all our packaging and marketing materials. From product labels to promotional flyers, they consistently deliver high-quality prints that make our brand look professional.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Chika Nwosu",
    role: "Real Estate Agent",
    location: "Maitama, Abuja",
    content: "I depend on PrintEdge.ng for all my premium marketing materials. The quality of their brochures and business cards reflects the luxury properties I sell. Excellent service every time!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Dr. Emeka Obi",
    role: "Healthcare Professional",
    location: "Central Area, Abuja",
    content: "PrintEdge.ng designed and printed our medical practice branding materials. From appointment cards to clinic signage, everything was professionally done and delivered on schedule.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            What Our <span className="text-primary">Customers Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of satisfied customers across Abuja who trust us with their printing and branding needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card border rounded-2xl p-6 hover:shadow-elegant transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-primary/20" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-secondary fill-current"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-card-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-card-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center animate-scale-in">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center animate-scale-in" style={{ animationDelay: "150ms" }}>
            <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">10,000+</div>
            <div className="text-muted-foreground">Orders Completed</div>
          </div>
          <div className="text-center animate-scale-in" style={{ animationDelay: "300ms" }}>
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">24hrs</div>
            <div className="text-muted-foreground">Average Delivery</div>
          </div>
          <div className="text-center animate-scale-in" style={{ animationDelay: "450ms" }}>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5★</div>
            <div className="text-muted-foreground">Customer Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;