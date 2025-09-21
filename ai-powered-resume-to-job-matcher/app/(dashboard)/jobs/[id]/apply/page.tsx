'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface Resume {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

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
}

export default function ApplyJobPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchJobAndResumes = async () => {
      try {
        // Fetch job details
        const jobRes = await fetch(`/api/jobs/${params.id}`);
        if (!jobRes.ok) {
          if (jobRes.status === 404) {
            toast({
              title: 'Error',
              description: 'Job not found',
              variant: 'destructive',
            });
            router.push('/jobs');
            return;
          }
          throw new Error('Failed to fetch job details');
        }
        
        const jobData = await jobRes.json();
        setJob(jobData);
        
        // Check if job is closed
        if (jobData.status !== 'active') {
          toast({
            title: 'Error',
            description: 'This job is no longer accepting applications',
            variant: 'destructive',
          });
          router.push(`/jobs/${params.id}`);
          return;
        }
        
        // Fetch user's resumes
        const resumesRes = await fetch('/api/resume');
        if (!resumesRes.ok) throw new Error('Failed to fetch resumes');
        
        const resumesData = await resumesRes.json();
        setResumes(resumesData);
        
        // Set the first resume as selected by default if available
        if (resumesData.length > 0) {
          setSelectedResumeId(resumesData[0].id);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load necessary data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobAndResumes();
  }, [params.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResumeId) {
      toast({
        title: 'Error',
        description: 'Please select a resume to apply with',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: params.id,
          resume_id: selectedResumeId,
          cover_letter: coverLetter,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
      
      toast({
        title: 'Success',
        description: 'Your application has been submitted successfully!',
      });
      
      // Redirect to applications page
      router.push('/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-center text-muted-foreground">
          Job not found or has been removed.
        </p>
        <Button 
          className="mt-4" 
          onClick={() => router.push('/jobs')}
        >
          Browse Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-4"
      >
        ← Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Apply for {job.title}</CardTitle>
          <CardDescription>{job.company} • {job.location}</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {resumes.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="resume">Select Resume</Label>
                <Select
                  value={selectedResumeId}
                  onValueChange={setSelectedResumeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">No resumes found</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You need to upload a resume before applying for jobs.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/resume')}
                      >
                        Upload Resume
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
              <Textarea
                id="cover-letter"
                placeholder="Write a cover letter to introduce yourself and explain why you're a good fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/jobs/${params.id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || resumes.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}