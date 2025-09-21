'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  created_at: string;
  status: 'pending' | 'reviewing' | 'rejected' | 'accepted' | 'interview';
  cover_letter?: string;
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  };
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'job_seeker' | 'recruiter' | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserTypeAndApplications = async () => {
      try {
        // Fetch user profile to determine user type
        const profileRes = await fetch('/api/profile');
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        
        const profileData = await profileRes.json();
        setUserType(profileData.user_type);
        
        // Fetch applications
        const applicationsRes = await fetch('/api/applications');
        if (!applicationsRes.ok) throw new Error('Failed to fetch applications');
        
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserTypeAndApplications();
  }, [toast]);

  const handleWithdrawApplication = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      const response = await fetch(`/api/applications?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to withdraw application');
      }
      
      // Remove the application from the list
      setApplications(prev => prev.filter(app => app.id !== id));
      
      toast({
        title: 'Success',
        description: 'Application withdrawn successfully',
      });
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to withdraw application',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: Application['status']) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update application status');
      }
      
      const updatedApplication = await response.json();
      
      // Update the application in the list
      setApplications(prev =>
        prev.map(app => (app.id === id ? updatedApplication : app))
      );
      
      toast({
        title: 'Success',
        description: 'Application status updated successfully',
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update application status',
        variant: 'destructive',
      });
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get color for status badge
  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format job type to be more readable
  const formatJobType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {userType === 'recruiter' ? 'Job Applications' : 'My Applications'}
      </h1>

      {applications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card key={application.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{application.jobs.title}</CardTitle>
                <CardDescription>
                  {application.jobs.company} • {application.jobs.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                    {formatJobType(application.jobs.type)}
                  </span>
                  <Badge 
                    className={`${getStatusColor(application.status)}`}
                    variant="outline"
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
                
                {userType === 'recruiter' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Applicant:</p>
                    <p className="text-sm">{application.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">{application.profiles.email}</p>
                  </div>
                )}
                
                {application.cover_letter && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Cover Letter:</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {application.cover_letter}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Applied on {formatDate(application.created_at)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                {userType === 'job_seeker' ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/jobs/${application.jobs.id}`)}
                    >
                      View Job
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleWithdrawApplication(application.id)}
                    >
                      Withdraw
                    </Button>
                  </>
                ) : (
                  <div className="flex w-full flex-col gap-2">
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={application.status}
                      onChange={(e) => handleUpdateStatus(application.id, e.target.value as Application['status'])}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/jobs/${application.jobs.id}`)}
                    >
                      View Job Details
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-muted-foreground">
            {userType === 'recruiter'
              ? 'No applications received yet for your job postings.'
              : 'You haven\'t applied to any jobs yet.'}
          </p>
          {userType === 'job_seeker' && (
            <Button 
              className="mt-4" 
              onClick={() => router.push('/jobs')}
            >
              Browse Jobs
            </Button>
          )}
        </div>
      )}
    </div>
  );
}