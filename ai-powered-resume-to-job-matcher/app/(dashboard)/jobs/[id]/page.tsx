'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  type: string;
  salary_range?: string;
  skills?: string[];
  created_at: string;
  status: 'active' | 'closed';
  recruiter_id: string;
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: 'Job not found',
              description: 'The job listing you are looking for does not exist.',
              variant: 'destructive',
            });
            router.push('/jobs');
            return;
          }
          throw new Error('Failed to fetch job details');
        }
        
        const data = await response.json();
        setJob(data);
        
        // Fetch user profile to determine if user is a job seeker or recruiter
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [params.id, router, toast]);

  const handleApply = async () => {
    try {
      setApplying(true);
      
      // Check if user has a resume
      const resumeResponse = await fetch('/api/resume');
      if (!resumeResponse.ok) {
        toast({
          title: 'No Resume Found',
          description: 'You need to upload a resume before applying for jobs.',
          variant: 'destructive',
        });
        router.push('/resume');
        return;
      }
      
      // TODO: Implement job application API
      // For now, just show a success message
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      toast({
        title: 'Job Deleted',
        description: 'The job listing has been deleted successfully.',
      });
      
      router.push('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setConfirmDelete(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format job type to be more readable
  const formatJobType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">The job listing you are looking for does not exist.</p>
        <Button onClick={() => router.push('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const isRecruiter = userProfile?.user_type === 'recruiter';
  const isJobOwner = isRecruiter && userProfile?.id === job.recruiter_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/jobs')}>
          ← Back to Jobs
        </Button>
        {isJobOwner && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/jobs/edit/${params.id}`)}>
              Edit Job
            </Button>
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete Job</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this job listing? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{job.title}</CardTitle>
              <CardDescription className="text-lg">{job.company} • {job.location}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm">
                {formatJobType(job.type)}
              </span>
              {job.salary_range && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm">
                  {job.salary_range}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="whitespace-pre-line">{job.description}</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Requirements</h3>
            <p className="whitespace-pre-line">{job.requirements}</p>
          </div>
          
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-secondary/50 px-3 py-1 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground">
              Posted on {formatDate(job.created_at)}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          {userProfile?.user_type === 'job_seeker' && job.status === 'active' && (
            <Button 
              onClick={() => router.push(`/jobs/${params.id}/apply`)}
              className="w-full"
            >
              Apply Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}