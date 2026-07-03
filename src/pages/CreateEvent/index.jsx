import React from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { EventForm } from './components/EventForm';

export const CreateEvent = () => {
  return (
    <PageTransition>
      <PageContainer>
        <SectionWrapper>
          <AxisMarker index="09" label="Event Operations" />
          
          <div className="flex flex-col mb-16 max-w-2xl text-left">
            <h1 className="text-display-l text-primary mb-6 font-light">Publish Event</h1>
            <p className="text-body-l text-secondary">
              Configure and publish a new event into the campus archive. Ensure all details, limits, and deadlines are correctly defined.
            </p>
          </div>

          <EventForm />
        </SectionWrapper>
      </PageContainer>
    </PageTransition>
  );
};
