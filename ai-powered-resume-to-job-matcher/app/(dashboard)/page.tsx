'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/auth-actions';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  userType: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData as UserProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user?.userType === 'recruiter' && (
          <Link href="/jobs/create">
            <Button>New Job</Button>
          </Link>
        )}
      </div>
      
      {/* Welcome Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || 'User'}!</CardTitle>
          <CardDescription>
            {user?.userType === 'job_seeker' 
              ? 'Find your perfect job match with AI-powered recommendations.'
              : 'Find the perfect candidates for your job openings.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your account type: <span className="font-medium capitalize">{user?.userType?.replace('_', ' ') || 'User'}</span></p>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user?.userType === 'job_seeker' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Resume Uploads</CardTitle>
                <CardDescription>Track your resume uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Resumes uploaded</p>
                <div className="mt-4">
                  <Link href="/resumes">
                    <Button variant="outline" size="sm">Manage Resumes</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Job Matches</CardTitle>
                <CardDescription>AI-powered job matches</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Potential matches found</p>
                <div className="mt-4">
                  <Link href="/matches">
                    <Button variant="outline" size="sm">View Matches</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Keep your profile up to date to improve job matching</p>
                <div className="mt-4">
                  <Link href="/profile">
                    <Button variant="outline" size="sm">Edit Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>Your active job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active job listings</p>
                <div className="mt-4">
                  <Link href="/jobs">
                    <Button variant="outline" size="sm">Manage Jobs</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Candidate Matches</CardTitle>
                <CardDescription>AI-matched candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Potential candidates</p>
                <div className="mt-4">
                  <Link href="/candidates">
                    <Button variant="outline" size="sm">View Candidates</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Job posting performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Track the performance of your job listings</p>
                <div className="mt-4">
                  <Link href="/analytics">
                    <Button variant="outline" size="sm">View Analytics</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent actions and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    </div>
  );
}