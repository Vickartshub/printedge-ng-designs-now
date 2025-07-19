import Header from "@/components/Header";
import EditableBanner from "@/components/EditableBanner";
import FeaturedServices from "@/components/FeaturedServices";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <EditableBanner />
      <FeaturedServices />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
