import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';
import FileUpload from './FileUpload';

export interface FormData {
  hrEmail: string;
  companyWebsite: string;
  hadInterview: boolean;
  paymentRequested: boolean;
  interviewRounds: number;
}

interface RiskFormProps {
  onSubmit: (data: FormData, file: File) => void;
  isAnalyzing: boolean;
}

const RiskForm = ({ onSubmit, isAnalyzing }: RiskFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    hrEmail: '',
    companyWebsite: '',
    hadInterview: true,
    paymentRequested: false,
    interviewRounds: 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(formData, file);
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          Offer Letter (PDF)
        </Label>
        <FileUpload onFileSelect={setFile} isProcessing={isAnalyzing} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hrEmail" className="text-sm font-medium text-foreground mb-1.5 block">
            HR Email Address
          </Label>
          <Input
            id="hrEmail"
            type="email"
            placeholder="hr@company.com"
            value={formData.hrEmail}
            onChange={(e) => update('hrEmail', e.target.value)}
            className="bg-surface-elevated border-border focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div>
          <Label htmlFor="companyWebsite" className="text-sm font-medium text-foreground mb-1.5 block">
            Company Website
          </Label>
          <Input
            id="companyWebsite"
            type="text"
            placeholder="company.com"
            value={formData.companyWebsite}
            onChange={(e) => update('companyWebsite', e.target.value)}
            className="bg-surface-elevated border-border focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rounds" className="text-sm font-medium text-foreground mb-1.5 block">
          Number of Interview Rounds
        </Label>
        <Input
          id="rounds"
          type="number"
          min={0}
          max={20}
          value={formData.interviewRounds}
          onChange={(e) => update('interviewRounds', parseInt(e.target.value) || 0)}
          className="bg-surface-elevated border-border focus:ring-1 focus:ring-primary/20 w-24"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
          <Label htmlFor="interview" className="text-sm text-foreground cursor-pointer">
            Was there an interview?
          </Label>
          <Switch
            id="interview"
            checked={formData.hadInterview}
            onCheckedChange={(v) => update('hadInterview', v)}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
          <Label htmlFor="payment" className="text-sm text-foreground cursor-pointer">
            Was any payment requested?
          </Label>
          <Switch
            id="payment"
            checked={formData.paymentRequested}
            onCheckedChange={(v) => update('paymentRequested', v)}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!file || isAnalyzing}
        className="w-full h-11 rounded-lg font-medium text-sm"
      >
        {isAnalyzing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" strokeWidth={1.5} />
            Analyze Risk
          </span>
        )}
      </Button>
    </form>
  );
};

export default RiskForm;
