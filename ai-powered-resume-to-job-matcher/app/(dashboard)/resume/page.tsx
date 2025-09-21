'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<{ id: string; name: string; uploadDate: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading resumes
  useState(() => {
    setTimeout(() => {
      setResumes([
        { id: '1', name: 'My_Resume_2023.pdf', uploadDate: '2023-10-15', status: 'analyzed' },
        { id: '2', name: 'Technical_CV.pdf', uploadDate: '2023-09-22', status: 'analyzed' },
      ]);
      setLoading(false);
    }, 1000);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a resume file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('resume', file);

      // TODO: Implement actual API call
      // const response = await fetch('/api/resume/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // if (!response.ok) throw new Error('Failed to upload resume');
      // const data = await response.json();

      // Simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add the new resume to the list
      const newResume = {
        id: Date.now().toString(),
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing',
      };

      setResumes(prev => [newResume, ...prev]);
      setFile(null);
      
      toast({
        title: 'Resume uploaded',
        description: 'Your resume has been uploaded and is being processed.',
      });

      // Reset the file input
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement actual API call
      // await fetch(`/api/resume/${id}`, {
      //   method: 'DELETE',
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove from UI
      setResumes(prev => prev.filter(resume => resume.id !== id));
      
      toast({
        title: 'Resume deleted',
        description: 'Your resume has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting your resume. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Resume Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>Upload your resume to find matching jobs</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpload}>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload">Resume File</Label>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Accepted formats: PDF, DOC, DOCX. Max size: 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={!file || uploading} className="w-full">
                  {uploading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                      Uploading...
                    </>
                  ) : (
                    'Upload Resume'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Resumes</CardTitle>
              <CardDescription>Manage your uploaded resumes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : resumes.length > 0 ? (
                <div className="space-y-4">
                  {resumes.map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{resume.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {resume.uploadDate}
                        </p>
                        <div className="mt-1">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              resume.status === 'analyzed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {resume.status === 'analyzed' ? 'Analyzed' : 'Processing'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(resume.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No resumes uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}