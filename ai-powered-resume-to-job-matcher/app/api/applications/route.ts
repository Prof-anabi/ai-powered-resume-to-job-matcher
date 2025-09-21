import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler to fetch all applications for a user or job
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('job_id');
  const userId = searchParams.get('user_id');
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Build query based on parameters
    let query = supabase.from('applications').select(`
      id,
      created_at,
      status,
      cover_letter,
      jobs(id, title, company, location, type),
      profiles(id, full_name, email)
    `);
    
    // Filter by job ID if provided
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    
    // Filter by user ID if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // If no filters provided, return user's own applications if job seeker
    // or applications for recruiter's jobs if recruiter
    if (!jobId && !userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.user_type === 'job_seeker') {
        query = query.eq('user_id', session.user.id);
      } else if (profile?.user_type === 'recruiter') {
        // Get jobs posted by this recruiter
        const { data: recruiterJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('recruiter_id', session.user.id);
        
        if (recruiterJobs && recruiterJobs.length > 0) {
          const jobIds = recruiterJobs.map(job => job.id);
          query = query.in('job_id', jobIds);
        } else {
          // Recruiter has no jobs, return empty array
          return NextResponse.json([]);
        }
      }
    }
    
    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST handler to create a new application
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile to check if they are a job seeker
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    if (!profile || profile.user_type !== 'job_seeker') {
      return NextResponse.json(
        { error: 'Only job seekers can apply for jobs' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { job_id, cover_letter, resume_id } = await request.json();
    
    // Validate required fields
    if (!job_id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('id', job_id)
      .single();
    
    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Check if job is still active
    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }
    
    // Check if user has already applied for this job
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', job_id)
      .eq('user_id', session.user.id)
      .single();
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }
    
    // Create the application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id,
        user_id: session.user.id,
        cover_letter,
        resume_id,
        status: 'pending'
      })
      .select(`
        id,
        created_at,
        status,
        cover_letter,
        jobs(id, title, company, location, type),
        profiles(id, full_name, email)
      `)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

// PUT handler to update an application status (for recruiters)
export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile to check if they are a recruiter
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    if (!profile || profile.user_type !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can update application status' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { id, status } = await request.json();
    
    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status value
    const validStatuses = ['pending', 'reviewing', 'rejected', 'accepted', 'interview'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Get the application to check if it belongs to a job posted by this recruiter
    const { data: application } = await supabase
      .from('applications')
      .select('job_id')
      .eq('id', id)
      .single();
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Check if the job belongs to this recruiter
    const { data: job } = await supabase
      .from('jobs')
      .select('recruiter_id')
      .eq('id', application.job_id)
      .single();
    
    if (!job || job.recruiter_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update applications for your own job postings' },
        { status: 403 }
      );
    }
    
    // Update the application status
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select(`
        id,
        created_at,
        status,
        cover_letter,
        jobs(id, title, company, location, type),
        profiles(id, full_name, email)
      `)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE handler to withdraw an application (for job seekers)
export async function DELETE(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Application ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the application belongs to this user
    const { data: application } = await supabase
      .from('applications')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    if (application.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only withdraw your own applications' },
        { status: 403 }
      );
    }
    
    // Delete the application
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    );
  }
}