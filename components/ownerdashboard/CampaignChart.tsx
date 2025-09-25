'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CampaignChartProps {
  className?: string;
  companyId?: string;
}

interface BarDataItem {
  date: string;
  applications: number;
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

export function CampaignChart({ className, companyId }: CampaignChartProps) {
  const [chartData, setChartData] = useState<{
    barData: BarDataItem[];
    pieData: PieDataItem[];
    isLoading: boolean;
    error: string | null;
  }>({
    barData: [],
    pieData: [],
    isLoading: true,
    error: null
  });

  const fetchChartData = useCallback(async () => {
    try {
      setChartData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Build query parameters
      const params = new URLSearchParams({ dateRange: 'last30days' });
      if (companyId) {
        params.append('companyIds', companyId);
      }
      
      // Fetch both applications over time and campaign status distribution
      const [applicationsResponse, campaignStatusResponse] = await Promise.all([
        fetch(`/api/dashboard/applications-chart?${params.toString()}`),
        fetch(`/api/dashboard/campaign-status?${companyId ? `companyIds=${companyId}` : ''}`)
      ]);

      if (!applicationsResponse.ok || !campaignStatusResponse.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const [applicationsData, campaignStatusData] = await Promise.all([
        applicationsResponse.json(),
        campaignStatusResponse.json()
      ]);

      setChartData({
        barData: applicationsData.chartData || [],
        pieData: campaignStatusData.chartData || [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setChartData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chart data'
      }));
    }
  }, [companyId]);

  useEffect(() => {
    fetchChartData();
  }, []);

  const renderError = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <p className="text-sm text-muted-foreground mb-4">{chartData.error}</p>
      <Button variant="outline" size="sm" onClick={fetchChartData}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );

  const renderEmptyState = (title: string) => (
    <div className="h-full flex items-center justify-center text-center p-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        <p className="text-xs text-muted-foreground">Data will appear here once available</p>
      </div>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Applications Over Time */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Applications Over Time</CardTitle>
            <CardDescription>Daily application trends (Last 30 days)</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchChartData}
            disabled={chartData.isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${chartData.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.error ? renderError() : chartData.isLoading ? (
            <div className="h-full w-full bg-muted animate-pulse rounded"></div>
          ) : chartData.barData.length === 0 ? 
            renderEmptyState('No application data available') : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.barData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="applications" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Applications"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Campaign Status Distribution */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Campaign Status</CardTitle>
          <CardDescription>Distribution of campaign statuses</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.error ? renderError() : chartData.isLoading ? (
            <div className="h-full w-full bg-muted animate-pulse rounded"></div>
          ) : chartData.pieData.length === 0 || (chartData.pieData.length === 1 && chartData.pieData[0].name === 'No Campaigns') ? 
            renderEmptyState('No campaign data available') : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
