import React from "react";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { EditorialImage } from "../../../components/ui/EditorialImage";
import { RevealSection, RevealItem, StandaloneReveal } from "../../../components/ui/RevealSection";

const testimonials = [
  {
    id: 1,
    quote: "The interface completely removes the friction of attending campus events. It feels less like software and more like a carefully designed physical space.",
    name: "Elena Rostova",
    role: "Computer Science '26",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    quote: "Finally, a platform that matches the caliber of the events we host. The aesthetic minimalism allows the actual content to shine without distraction.",
    name: "Marcus Chen",
    role: "Design Council Chair",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
  }
];

export const Testimonials = () => {
  return (
    <section className="w-full flex flex-col mb-32 pt-24">
      <StandaloneReveal margin="-5%">
        <AxisMarker index="06" label="Campus Voices" />
      </StandaloneReveal>

      <RevealSection margin="-5%" staggerDelay={0.18}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 md:gap-32 max-w-[1200px] w-full">
          {testimonials.map((t, index) => (
            <RevealItem key={t.id} delay={index * 0.1} as="article">
              <article className="flex flex-col relative group">
                <p className="text-display-m text-primary font-light mb-16 max-w-lg transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-secondary">
                  {t.quote}
                </p>

                <div className="flex items-center gap-6 mt-auto">
                  <RevealItem image>
                    <EditorialImage
                      src={t.image}
                      alt={t.name}
                      aspectRatio="aspect-square"
                      wrapperClassName="w-16 h-16"
                      grayscale={true}
                    />
                  </RevealItem>
                  <div className="flex flex-col gap-1">
                    <span className="text-body-s text-primary font-medium">{t.name}</span>
                    <span className="text-micro text-secondary opacity-75">{t.role}</span>
                  </div>
                </div>
              </article>
            </RevealItem>
          ))}
        </div>
      </RevealSection>
    </section>
  );
};
