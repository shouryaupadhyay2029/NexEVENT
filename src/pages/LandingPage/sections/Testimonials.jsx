import React from "react";
import { motion } from "framer-motion";
import { AxisMarker } from "../../../components/layout/AxisMarker";
import { EditorialImage } from "../../../components/ui/EditorialImage";

const ease = [0.16, 1, 0.3, 1];

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
      <AxisMarker index="06" label="Campus Voices" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 md:gap-32 max-w-[1200px] w-full">
        {testimonials.map((t, index) => (
          <motion.article 
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: index * 0.2, ease }}
            className="flex flex-col relative group"
          >
            <p className="text-[2rem] font-display text-primary leading-[1.1] tracking-[-0.02em] mb-16 max-w-lg transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-secondary">
              {t.quote}
            </p>
            
            <div className="flex items-center gap-6 mt-auto">
              <EditorialImage 
                src={t.image} 
                alt={t.name}
                aspectRatio="aspect-square"
                wrapperClassName="w-16 h-16"
                grayscale={true}
              />
              <div className="flex flex-col gap-1">
                <span className="text-body font-ui text-primary font-medium tracking-wide">{t.name}</span>
                <span className="text-[0.65rem] font-technical uppercase tracking-[0.25em] text-secondary">{t.role}</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
