'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, BarChart3, CheckCircle, Plus, Search } from 'lucide-react';

interface ActivityFeedProps {
  className?: string;
}

interface HowToStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: 'create' | 'track' | 'evaluate' | 'select' | 'analyze' | 'manage';
  status: 'start' | 'progress' | 'complete' | 'pending';
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  const howToSteps: HowToStep[] = [
    {
      id: '1',
      stepNumber: 1,
      title: 'Create Your Campaign',
      description: 'Define job requirements, set criteria, and launch your recruitment campaign',
      icon: 'create',
      status: 'start'
    },
    {
      id: '2',
      stepNumber: 2,
      title: 'Track Applications',
      description: 'Monitor incoming applications and review candidate profiles in real-time',
      icon: 'track',
      status: 'progress'
    },
    {
      id: '3',
      stepNumber: 3,
      title: 'Evaluate Candidates',
      description: 'Feature coming soon - Conduct screening rounds and assign marks to candidates',
      icon: 'evaluate',
      status: 'pending'
    },
    {
      id: '4',
      stepNumber: 4,
      title: 'Select Top Talent',
      description: 'Feature coming soon - Choose the best candidates and send offers',
      icon: 'select',
      status: 'pending'
    },
    {
      id: '5',
      stepNumber: 5,
      title: 'Analyze Campaign Performance',
      description: 'Review campaign metrics, track top candidates, and optimize recruitment strategies',
      icon: 'analyze',
      status: 'complete'
    }
  ];

  const getStepIcon = (icon: string) => {
    switch (icon) {
      case 'create':
        return <Plus className="h-5 w-5 text-white" />;
      case 'track':
        return <Search className="h-5 w-5 text-white" />;
      case 'evaluate':
        return <FileText className="h-5 w-5 text-white" />;
      case 'select':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'analyze':
        return <BarChart3 className="h-5 w-5 text-white" />;
      default:
        return <Users className="h-5 w-5 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'start':
        return 'bg-blue-500';
      case 'progress':
        return 'bg-orange-500';
      case 'complete':
        return 'bg-green-500';
      case 'pending':
        return 'bg-gray-400';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'start':
        return 'GET STARTED';
      case 'progress':
        return 'IN PROGRESS';
      case 'complete':
        return 'AVAILABLE';
      case 'pending':
        return 'COMING SOON';
      default:
        return 'PENDING';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div>
          <CardTitle className='mb-3'>How to Use INTERAIN Campus Recruitemnt Automation </CardTitle>
          <CardDescription>Step-by-step guide to streamline your recruitment process</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {howToSteps.map((step) => (
            <div key={step.id} className="flex gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                {getStepIcon(step.icon)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Step {step.stepNumber}: {step.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(step.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
