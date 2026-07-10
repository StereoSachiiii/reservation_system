import { useState, useEffect } from 'react';
import { Joyride, Step, STATUS } from 'react-joyride';

export const ReservationDetailTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('reservation-detail-tour-completed');
    if (!hasCompletedTour) {
      setRun(true);
      localStorage.setItem('reservation-detail-tour-completed', 'true');
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status, action, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status) || action === 'close' || type === 'tour:end') {
      setRun(false);
    }
  };

  const steps: Step[] = [
    {
      target: '.tour-hero',
      content: 'Welcome to your Reservation Details! This banner shows the overall status of your booking.',
      placement: 'bottom',
    },
    {
      target: '.tour-datetime',
      content: 'Here is the exact date and time your stall is reserved for. Mark your calendar!',
      placement: 'top',
    },
    {
      target: '.tour-location',
      content: 'This is the physical location and dimensions of your stall. You can find detailed hall specifications on the floor plan map.',
      placement: 'top',
    },
    {
      target: '.tour-ticket',
      content: 'Important! Download this QR code. You must show this to the venue employees for access on the day of the event.',
      placement: 'left',
    },
    {
      target: '.tour-payment',
      content: 'Review your billing summary or complete any pending payments here.',
      placement: 'left',
    },
  ];

  const JoyrideAny = Joyride as any;

  return (
    <JoyrideAny
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      callback={handleJoyrideCallback}
      styles={({
        options: {
          primaryColor: '#6366f1', // Indigo-500
          textColor: '#334155', // Slate-700
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(15, 23, 42, 0.7)',
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          borderRadius: '8px',
          fontWeight: 600,
        },
        buttonBack: {
          color: '#64748b', // Slate-500
        },
        buttonSkip: {
          color: '#94a3b8', // Slate-400
        }
      } as any)}
    />
  );
};
