'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function ResumesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch existing resumes on component mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        // TODO: Replace with actual API call to fetch resumes
        // const response = await fetch('/api/resumes');
        // const data = await response.json();
        // setResumes(data);
        
        // Mock data for now
        setResumes([
          {
            id: '1',
            name: 'resume-example.pdf',
            uploadedAt: new Date().toISOString(),
            status: 'Processed',
          }
        ]);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to our API endpoint
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload resume');
      }
      
      const result = await response.json();
      
      // Add the new resume to the list
      setResumes(prev => [
        {
          id: result.id,
          name: file.name,
          uploadedAt: new Date().toISOString(),
          status: 'Processing',
          ...result,
        },
        ...prev
      ]);
      
      // Reset file input
      setFile(null);
      
      // Show success message
      toast({
        title: 'Resume uploaded successfully',
        description: 'Your resume is being processed for job matching.',
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload resume',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resumes</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <CardDescription>Upload your resume for AI-powered job matching</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpload}>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="resume">Resume</Label>
              <Input 
                id="resume" 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Resumes</CardTitle>
          <CardDescription>Manage your uploaded resumes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading resumes...</p>
          ) : resumes.length > 0 ? (
            <div className="divide-y">
              {resumes.map((resume) => (
                <div key={resume.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{resume.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block
                      {resume.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                       resume.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-gray-100 text-gray-800'}"
                    >
                      {resume.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`/api/resumes/${resume.id}`, '_blank')}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/dashboard/matches?resumeId=${resume.id}`, '_blank')}>
                      Matches
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No resumes uploaded yet. Upload your first resume to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}