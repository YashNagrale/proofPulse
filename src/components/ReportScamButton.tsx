import { useState } from 'react';
import { Flag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ReportScamButton = () => {
  const [reported, setReported] = useState(false);
  const { toast } = useToast();

  const handleReport = () => {
    setReported(true);
    toast({
      title: 'Scam Reported',
      description: 'Thank you for reporting. This helps protect others from similar scams.',
    });
  };

  return (
    <Button
      variant={reported ? 'secondary' : 'destructive'}
      onClick={handleReport}
      disabled={reported}
      className="w-full"
    >
      {reported ? (
        <span className="flex items-center gap-2">
          <Check className="w-4 h-4" /> Reported
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Flag className="w-4 h-4" /> Report This as a Scam
        </span>
      )}
    </Button>
  );
};

export default ReportScamButton;
