import { WebGLShader } from "@/components/ui/web-gl-shader";
import { HeroSection } from "@/components/hero-section";
import { Gallery6 } from "@/components/ui/gallery6";
import { FooterSection } from "@/components/static";

export default function Home() {
  return (
    <div className="relative">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <WebGLShader /> 
        <HeroSection />
      </div>
      <div className="relative w-full bg-background/50 backdrop-blur-sm">
        <Gallery6 />
      </div>
      <div className="relative bg-background">
        <FooterSection />
      </div>
    </div>
  );
}
