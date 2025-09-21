import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { matchResumeToJobs } from '@/lib/ai/gemini';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    
    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    const db = await getMongoDb();
    const matchesCollection = db.collection('matches');
    
    // Get existing matches for this resume
    const matches = await matchesCollection
      .find({ resumeId })
      .sort({ matchScore: -1 }) // Sort by match score descending
      .toArray();
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { resumeId } = await request.json();
    
    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    const db = await getMongoDb();
    const resumesCollection = db.collection('resumes');
    const jobsCollection = db.collection('jobs');
    const matchesCollection = db.collection('matches');
    
    // Get resume data
    const resume = await resumesCollection.findOne({ id: resumeId });
    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    // Get all jobs
    const jobs = await jobsCollection.find({}).toArray();
    if (jobs.length === 0) {
      return NextResponse.json(
        { message: 'No jobs available for matching' },
        { status: 200 }
      );
    }
    
    // Use Gemini API to match resume to jobs
    const matchResults = await matchResumeToJobs(resume, jobs);
    
    // Save match results to database
    const matchOperations = matchResults.map(match => ({
      updateOne: {
        filter: { resumeId, jobId: match.jobId },
        update: { $set: match },
        upsert: true
      }
    }));
    
    await matchesCollection.bulkWrite(matchOperations);
    
    return NextResponse.json({
      message: 'Job matching completed successfully',
      matchCount: matchResults.length
    });
  } catch (error) {
    console.error('Error matching resume to jobs:', error);
    return NextResponse.json(
      { error: 'Failed to match resume to jobs' },
      { status: 500 }
    );
  }
}