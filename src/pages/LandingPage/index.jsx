import React from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Hero } from "./sections/Hero";
import { FeaturedEvent } from "./sections/FeaturedEvent";
import { WhyNexEvent } from "./sections/WhyNexEvent";
import { Categories } from "./sections/Categories";
import { UpcomingEvents } from "./sections/UpcomingEvents";
import { Statistics } from "./sections/Statistics";
import { Testimonials } from "./sections/Testimonials";
import { FAQ } from "./sections/FAQ";
import { FinalCTA } from "./sections/FinalCTA";

export const LandingPage = () => {
  return (
    <PageContainer width="1400px" className="px-0 md:px-0 pt-0">
      <Hero />
      <FeaturedEvent />
      <WhyNexEvent />
      <Categories />
      <UpcomingEvents />
      <Statistics />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </PageContainer>
  );
};
