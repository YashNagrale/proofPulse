import { useState } from 'react';
import { Copy, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AutoReplyGenerator = ({ riskLevel, companyName }: { riskLevel: string; companyName: string }) => {
  const [copied, setCopied] = useState(false);

  const company = companyName || 'the company';

  const templates: Record<string, string> = {
    'High Risk': `Dear Sir/Madam,

Thank you for the offer from ${company}. However, after careful review, I have identified several concerns regarding the authenticity of this offer letter.

I will not be proceeding with this opportunity. I would advise verifying the legitimacy of the hiring process through official company channels.

Regards`,

    'Medium Risk': `Dear Sir/Madam,

Thank you for the offer from ${company}. Before I proceed, I would like to verify the following:

1. Could you please share the official company website and your corporate email address?
2. Can you provide details of the interview process and next steps?
3. Are there any fees or payments associated with the onboarding process?

I look forward to your response.

Regards`,

    'Low Risk': `Dear Sir/Madam,

Thank you for the offer from ${company}. I am pleased to accept and look forward to joining the team.

Could you please share the onboarding details and any documents I need to prepare?

Best regards`,
  };

  const emailText = templates[riskLevel] || templates['Medium Risk'];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Mail className="w-4 h-4" strokeWidth={1.5} />
        Suggested Reply Email
      </h3>
      <div className="relative p-4 rounded-lg bg-accent/30 border border-border">
        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
          {emailText}
        </pre>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default AutoReplyGenerator;
