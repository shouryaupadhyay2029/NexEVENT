import React from 'react';
import { Button } from '../../../components/ui/Button';
import { EventInfoGrid } from './EventInfoGrid';
import { getParticipationHours } from '../../../utils/clubHours';

export const RegistrationPanel = ({ event, isRegistered, onRegister, isRegistering }) => {
  const isOpen = event.status?.toLowerCase() === "open";

  // Determine button copy and interaction locks
  let buttonLabel = "Register Now";
  let isButtonDisabled = !isOpen || isRegistering;

  if (isRegistered) {
    buttonLabel = "Registered ✓";
    isButtonDisabled = true;
  } else if (isRegistering) {
    buttonLabel = "Registering...";
    isButtonDisabled = true;
  } else if (!isOpen) {
    buttonLabel = "Registration Closed";
    isButtonDisabled = true;
  }

  return (
    <div className="flex flex-col gap-8 min-w-[320px] w-full md:w-[360px] border border-white/5 bg-[#090909]/40 backdrop-blur-md p-8 relative rounded-none">
      <h3 className="text-micro text-primary border-b border-white/5 pb-4 mb-2">
        EVENT ACCESS // PANEL
      </h3>
      
      <EventInfoGrid event={event} />
      
      {getParticipationHours(event) > 0 && (
        <div className="flex flex-col gap-2.5 pt-4 border-t border-white/5 text-left">
          <span className="text-[0.6rem] text-white/30 font-technical uppercase tracking-[0.2em]">
            Club Hours // Credit
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-display-m font-light text-accent">
              {getParticipationHours(event)}
            </span>
            <span className="text-xs font-light text-primary">HRS Participation Credit</span>
          </div>
          <p className="text-[0.62rem] text-white/40 leading-normal font-light">
            Eligible after verified event attendance and faculty approval.
          </p>
        </div>
      )}

      <Button
        variant="primary"
        disabled={isButtonDisabled}
        onClick={onRegister}
        className="w-full h-12 flex items-center justify-center text-xs uppercase tracking-wider font-technical"
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
