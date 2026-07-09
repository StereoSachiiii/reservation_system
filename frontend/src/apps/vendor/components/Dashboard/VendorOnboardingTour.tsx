import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

export const VendorOnboardingTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour once per user by checking localStorage
    const hasCompletedTour = localStorage.getItem('vendor-tour-completed');
    if (!hasCompletedTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('vendor-tour-completed', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: '.tour-welcome',
      content: 'Welcome to your new Vendor Dashboard! Let us show you around.',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: '.tour-book-button',
      content: 'Click here whenever you want to browse the floor plan and reserve a new stall.',
      placement: 'bottom',
    },
    {
      target: '.tour-stats',
      content: 'Keep an eye on your stall limit here. You can reserve up to your approved limit.',
      placement: 'bottom',
    },
    {
      target: '.tour-reservations',
      content: 'All your active and pending stall reservations will appear in this table. You can also cancel them from here if needed.',
      placement: 'top',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#6366f1', // Indigo-500
          textColor: '#334155', // Slate-700
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(15, 23, 42, 0.7)', // Slate-900 with opacity
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
      }}
    />
  );
};
