

export interface Logo {
  name: string;
  src?: string;
}

export function LogoMarquee({ logos }: { logos: Logo[] }) {
  return (
    <div className="relative overflow-hidden py-8 border-y border-neutral-100 bg-neutral-50">
      <p className="text-center text-xs font-medium text-neutral-400 uppercase tracking-wider mb-6">
        Trusted by premier venues
      </p>
      <div className="flex animate-marquee gap-16 w-max items-center">
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="flex items-center justify-center min-w-[150px]">
            {logo.src ? (
              <img
                src={logo.src}
                alt={logo.name}
                className="h-8 w-auto opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            ) : (
              <span className="text-xl font-bold text-neutral-900 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">{logo.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
