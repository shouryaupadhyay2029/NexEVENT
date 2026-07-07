import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/layout/PageTransition';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionWrapper } from '../../components/layout/SectionWrapper';
import { AxisMarker } from '../../components/layout/AxisMarker';
import { Button } from '../../components/ui/Button';
import { AlertOctagon, WifiOff, FileSearch, ShieldAlert, ArrowLeft } from 'lucide-react';

export const ErrorPage = ({ type = '404' }) => {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (type) {
      case '403':
        return {
          marker: '403',
          title: 'Access Restricted',
          desc: 'Your security profile does not hold the required authorization level to view this route directory. Organizer or Admin privileges are required.',
          icon: <ShieldAlert className="w-12 h-12 text-accent stroke-[1]" />
        };
      case 'offline':
        return {
          marker: 'NET',
          title: 'No Network Connection',
          desc: 'Your client local network is currently unreachable. Check your router, local adapters, or active firewalls and retry.',
          icon: <WifiOff className="w-12 h-12 text-accent stroke-[1]" />
        };
      case '500':
      case 'database':
        return {
          marker: '500',
          title: 'Database Operation Exception',
          desc: 'The database server responded with an internal exception. This usually indicates a Firestore transaction lockout, network failure, or permission security failure.',
          icon: <AlertOctagon className="w-12 h-12 text-accent stroke-[1]" />
        };
      case '404':
      default:
        return {
          marker: '404',
          title: 'Frame Not Found',
          desc: 'The requested route address or document ID does not exist in the active records mapping database. It might have been moved or archived.',
          icon: <FileSearch className="w-12 h-12 text-accent stroke-[1]" />
        };
    }
  };

  const error = getErrorContent();

  return (
    <PageTransition>
      <PageContainer>
        <SectionWrapper className="min-h-[75vh] flex flex-col justify-center max-w-xl py-12 md:py-20 text-left relative font-ui">
          {/* Axis Marker */}
          <AxisMarker index={error.marker} label="Diagnostic Log" />

          {/* Icon */}
          <div className="mb-6 mt-4 w-16 h-16 border border-white/10 bg-white/[0.01] flex items-center justify-center">
            {error.icon}
          </div>

          {/* Heading */}
          <div className="flex flex-col mb-8">
            <span className="text-[9px] font-technical text-accent uppercase tracking-[0.3em] mb-2 font-medium">
              System Exception // Code {error.marker}
            </span>
            <h1 className="text-[34px] md:text-[38px] leading-[1.1] font-display font-extralight text-primary tracking-tighter">
              {error.title}
            </h1>
            <p className="text-[13px] text-white/35 font-light mt-3 leading-relaxed">
              {error.desc}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-white/[0.05]">
            <Button onClick={() => navigate(-1)} className="flex items-center gap-1.5 font-technical uppercase">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')} className="font-technical uppercase">
              Main Dashboard
            </Button>
          </div>
        </SectionWrapper>
      </PageContainer>
    </PageTransition>
  );
};
