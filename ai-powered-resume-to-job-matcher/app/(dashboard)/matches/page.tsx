'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface JobMatch {
  id: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  matchDetails: {
    skills: string[];
    experience: string;
    education: string;
    recommendations: string[];
  };
}

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/matches?resumeId=${resumeId}`);
        // const data = await response.json();
        // setMatches(data);
        
        // Mock data for now
        setTimeout(() => {
          setMatches([
            {
              id: '1',
              jobTitle: 'Frontend Developer',
              company: 'Tech Solutions Inc.',
              matchScore: 85,
              matchDetails: {
                skills: ['React', 'TypeScript', 'CSS'],
                experience: 'Good match for required experience',
                education: 'Meets education requirements',
                recommendations: [
                  'Add more details about your React project experience',
                  'Highlight your TypeScript skills more prominently'
                ]
              }
            },
            {
              id: '2',
              jobTitle: 'Full Stack Engineer',
              company: 'Digital Innovations',
              matchScore: 72,
              matchDetails: {
                skills: ['React', 'Node.js', 'MongoDB'],
                experience: 'Partial match for required experience',
                education: 'Meets education requirements',
                recommendations: [
                  'Add backend project examples',
                  'Highlight database experience'
                ]
              }
            },
            {
              id: '3',
              jobTitle: 'UI/UX Developer',
              company: 'Creative Design Studio',
              matchScore: 68,
              matchDetails: {
                skills: ['UI Design', 'CSS', 'User Testing'],
                experience: 'Partial match for required experience',
                education: 'Meets education requirements',
                recommendations: [
                  'Add design portfolio examples',
                  'Highlight any user research experience'
                ]
              }
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job matches',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [resumeId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Matches</h1>
        {resumeId && (
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Resumes
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Loading job matches...</p>
          </CardContent>
        </Card>
      ) : !resumeId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please select a resume to view job matches</p>
          </CardContent>
        </Card>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">No job matches found for this resume</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Matches</CardTitle>
                <CardDescription>Click on a job to view match details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {matches.map((match) => (
                    <div 
                      key={match.id} 
                      className={`p-4 rounded-md cursor-pointer transition-colors ${selectedMatch?.id === match.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{match.jobTitle}</h3>
                        <Badge className={getScoreColor(match.matchScore)}>
                          {match.matchScore}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{match.company}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {selectedMatch ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedMatch.jobTitle}</CardTitle>
                      <CardDescription>{selectedMatch.company}</CardDescription>
                    </div>
                    <Badge className={getScoreColor(selectedMatch.matchScore)} className="text-lg px-3 py-1">
                      {selectedMatch.matchScore}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Skills Match</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMatch.matchDetails.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Experience</h3>
                      <p>{selectedMatch.matchDetails.experience}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Education</h3>
                      <p>{selectedMatch.matchDetails.education}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedMatch.matchDetails.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => window.open(`/dashboard/jobs/${selectedMatch.id}`, '_blank')}>
                    View Full Job Details
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-muted-foreground">Select a job match to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}