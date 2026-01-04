import { WebGLShader } from "@/components/ui/web-gl-shader";
import { HeroSection } from "@/components/hero-section";
import { FeaturesGrid } from "@/components/features-grid";
import { FooterSection } from "@/components/static";

export default function Home() {
  return (
    <div className="relative">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <WebGLShader /> 
        <HeroSection />
      </div>
      <div className="relative flex w-full flex-col items-center justify-center px-4 pb-16 md:pb-20 bg-background">
        <FeaturesGrid />
      </div>
      <div className="relative bg-background">
        <FooterSection />
      </div>
    </div>
  );
}
