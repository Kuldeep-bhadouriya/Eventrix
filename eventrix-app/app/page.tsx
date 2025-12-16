import { WebGLShader } from "@/components/ui/web-gl-shader";
import { HeroSection } from "@/components/hero-section";
import { FeaturesGrid } from "@/components/features-grid";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <WebGLShader /> 
      <HeroSection />
      <FeaturesGrid />
    </div>
  );
}
