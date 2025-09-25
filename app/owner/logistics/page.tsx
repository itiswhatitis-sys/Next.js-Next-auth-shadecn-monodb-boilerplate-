'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
    Users,
    Phone,
    Mail,
    Globe,
    FileText,
    Building,
    Building2,
    Search,
    Clock,
    User,
    List,
    CheckCircle
} from 'lucide-react';
import { fetchLogisticCompanies } from '@/app/actions/getLogisticCompany';

interface ITeamMember {
  name: string;
  email: string;
  role: "operations" | "delivery-partner";
}

interface ICompany {
  _id: string;
  companyName: string;
  ownerName: string;
  contactNumber: string;
  companyEmail: string;
  gstNumber: string;
  address: string;
  teamMembers?: ITeamMember[];
  teamSkipped: boolean;
  createdAt: string;
}

export default function LogisticsPage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchLogisticCompanies();
            if (data.error) {
                toast.error('Error', { description: data.error });
            } else {
                setCompanies(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load logistic companies data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            toast.success('You have been successfully logged out');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout. Please try again.');
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const filteredCompanies = companies.filter(company => {
        return searchTerm === '' ||
            company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.companyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.gstNumber.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const recentCompanies = companies.filter(company => {
        const joinDate = new Date(company.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return joinDate >= thirtyDaysAgo;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Sidebar onLogout={handleLogout} />
                <div className="md:ml-64 p-4 md:p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* <Sidebar onLogout={handleLogout} /> */}
            
            <div className="md:ml-64 p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Logistics Partners</h1>
                    <p className="text-muted-foreground">
                        Manage all registered logistic companies
                    </p>
                </div>

                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="all">All Partners</TabsTrigger>
                        <TabsTrigger value="recent">Recent Partners</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Search & Filter</CardTitle>
                                <CardDescription>
                                    Find partners by company name, owner name, or GST number
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search partners..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {/* The filter selects for campaign and department are removed as they are not relevant to this page. */}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Companies Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCompanies.length === 0 ? (
                                <div className="col-span-full">
                                    <Card className="text-center p-8">
                                        <CardContent className="pt-8 pb-8">
                                            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium mb-2">No logistics partners found</h3>
                                            <p className="text-muted-foreground mb-4">
                                                There are no registered logistic companies yet.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                              filteredCompanies.map((company) => (
  <Card key={company._id} className="hover:shadow-lg transition-shadow">
    <CardHeader className="pb-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(company.companyName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{company.companyName}</h3>
          <Badge variant="default" className="mt-1 text-xs">
            Registered
          </Badge>
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-3">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="truncate">{company.ownerName} (Owner)</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="truncate">{company.companyEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{company.contactNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span className="truncate">{company.address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="truncate">GST: {company.gstNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          <span>Team: {company.teamSkipped ? "Not provided" : "Available"}</span>
        </div>
      </div>
    </CardContent>

    {/* Add Invite Button */}
    <div className="p-4 pt-0 flex items-center justify-center">
      <Button
        className="w-1/3 bg-black text-white dark:bg-white dark:text-black  py-2 rounded-md hover:bg-primary/90 transition-colors"
        // onClick={() => handleSendInvite(company._id)}
      >
        Send Invite
      </Button>
    </div>
  </Card>
))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="recent" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Partners</CardTitle>
                                <CardDescription>
                                    Companies registered in the last 30 days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentCompanies.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No recent partners</h3>
                                        <p className="text-muted-foreground">
                                            No companies have registered in the last 30 days.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recentCompanies.map((company) => (
                                            <Card key={company._id} className="hover:shadow-lg transition-shadow border-primary/20">
                                                <CardHeader className="pb-4">
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                {getInitials(company.companyName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold truncate">{company.companyName}</h3>
                                                            <Badge variant="default" className="mt-1 text-xs">
                                                                Recent
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                
                                                <CardContent className="space-y-3">
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <User className="h-4 w-4" />
                                                            <span className="truncate">{company.ownerName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="h-4 w-4" />
                                                            <span className="truncate">{company.companyEmail}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Registered: {new Date(company.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
