'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardsProps {
  className?: string;
  companyId?: string;
}

interface KPI {
  value: number;
  trend: number | null;
  label: string;
}

interface KPIData {
  totalCampaigns: KPI;
  activeCampaigns: KPI;
  totalApplications: KPI;
  pendingApplications: KPI;
  selectedCandidates: KPI;
  totalCompanies: KPI;
}

export function StatsCards({ className, companyId }: StatsCardsProps) {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchKPIs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({ dateRange: 'all' });
      if (companyId) {
        params.append('companyIds', companyId);
      }
      
      const response = await fetch(`/api/dashboard/kpis?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch KPIs');
      }
      
      const data = await response.json();
      setKpis(data.kpis);
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [companyId]);

  const renderTrendIndicator = (trend: number | null) => {
    if (trend === null || trend === 0) return null;
    
    const isPositive = trend > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <TrendIcon className="h-3 w-3" />
        <span className="text-xs font-medium">
          {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
    );
  };

  if (error) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{kpis?.totalCampaigns.value || 0}</div>
                {kpis?.totalCampaigns.trend && renderTrendIndicator(kpis.totalCampaigns.trend)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(kpis?.totalCampaigns.value || 0) > 0 
                  ? `${kpis?.totalCampaigns.value} campaigns created` 
                  : 'No campaigns yet'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{kpis?.activeCampaigns.value || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(kpis?.activeCampaigns.value || 0) > 0 
                  ? `${kpis?.activeCampaigns.value} campaigns in progress` 
                  : 'No active campaigns'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Total Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{kpis?.totalApplications.value || 0}</div>
                {kpis?.totalApplications.trend && renderTrendIndicator(kpis.totalApplications.trend)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(kpis?.totalApplications.value || 0) > 0 
                  ? `${kpis?.totalApplications.value} total applications received` 
                  : 'No applications yet'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Candidates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Selected Candidates</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{kpis?.selectedCandidates.value || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(kpis?.selectedCandidates.value || 0) > 0 
                  ? `${kpis?.selectedCandidates.value} candidates selected` 
                  : 'No selections yet'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
