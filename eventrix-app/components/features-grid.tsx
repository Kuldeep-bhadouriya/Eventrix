export function FeaturesGrid() {
  const features = [
    {
      title: "One-Click Event Registration",
      description: "Students register instantly using email."
    },
    {
      title: "QR-Based Event Passes",
      description: "Auto-generated passes delivered via email and WhatsApp."
    },
    {
      title: "Smart Organizer Dashboard",
      description: "Create events, upload certificates, and track participation."
    },
    {
      title: "Instant Certificates",
      description: "PDFs sent automatically after the event."
    }
  ];

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-16 md:mt-20 lg:mt-24 z-10">
      {features.map((feature, index) => (
        <div 
          key={index}
          className="text-center p-5 md:p-6 lg:p-7 xl:p-8 rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-300"
        >
          <h3 className="text-white font-semibold text-base lg:text-lg mb-3">
            {feature.title}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
