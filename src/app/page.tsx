import HeroSlideshow from "@/components/home/HeroSlideshow";
import ServicesIntro from "@/components/home/ServicesIntro";
import PartnersTestimonials from "@/components/home/PartnersTestimonials";
import LocationsPreview from "@/components/home/LocationsPreview";
import BlogPreview from "@/components/home/BlogPreview";
import LeafDivider from "@/components/shared/LeafDivider";

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />
      <ServicesIntro />
      <LeafDivider />
      <PartnersTestimonials />
      <LocationsPreview />
      <LeafDivider className="bg-green-50" />
      <BlogPreview />
    </>
  );
}
