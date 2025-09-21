import { NextRequest, NextResponse } from 'next/server';
import { matchResumeToJobs } from '@/lib/ai/gemini';
import { getCollection } from '@/lib/db/mongodb';

/**
 * API route for matching a resume to job descriptions using Gemini AI
 */
export async function POST(request: NextRequest) {
  try {
    const { resumeId, jobIds } = await request.json();

    if (!resumeId || !jobIds || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get resume analysis from MongoDB
    const resumesCollection = await getCollection('resumes', 'analyses');
    const resumeAnalysis = await resumesCollection.findOne({ resumeId });

    if (!resumeAnalysis) {
      return NextResponse.json(
        { error: 'Resume analysis not found' },
        { status: 404 }
      );
    }

    // Get job descriptions from MongoDB
    const jobsCollection = await getCollection('jobs', 'listings');
    const jobs = await jobsCollection
      .find({ _id: { $in: jobIds } })
      .toArray();

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs found with the provided IDs' },
        { status: 404 }
      );
    }

    // Match resume to jobs using Gemini AI
    const matches = await matchResumeToJobs(resumeAnalysis, jobs);

    // Store match results in MongoDB
    const matchesCollection = await getCollection('matches', 'results');
    await matchesCollection.insertOne({
      resumeId,
      jobIds,
      matches,
      createdAt: new Date(),
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error matching resume to jobs:', error);
    return NextResponse.json(
      { error: 'Failed to match resume to jobs' },
      { status: 500 }
    );
  }
}