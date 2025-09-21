import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/jobs - Get all jobs
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search') || '';
    const jobType = url.searchParams.get('type') || '';
    const location = url.searchParams.get('location') || '';
    
    // Start building the query
    let query = supabase.from('jobs').select('*');
    
    // Apply filters if provided
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,skills.cs.{${searchTerm}}`);
    }
    
    if (jobType) {
      query = query.eq('type', jobType);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    // Execute the query
    const { data: jobs, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get user profile to check if they are a recruiter
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    // Only recruiters can post jobs
    if (!userProfile || userProfile.user_type !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can post jobs' }, { status: 403 });
    }

    // Parse request body
    const jobData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'company', 'location', 'type', 'description', 'requirements'];
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Add additional metadata
    const newJob = {
      ...jobData,
      recruiter_id: userId,
      created_at: new Date().toISOString(),
      status: 'active',
    };

    // Insert job into database
    const { data, error } = await supabase
      .from('jobs')
      .insert([newJob])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/jobs/:id - Update a job
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get job ID from URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check if the job exists and belongs to the user
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('recruiter_id', userId)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    // Parse request body
    const jobData = await request.json();
    
    // Don't allow changing the recruiter_id
    delete jobData.recruiter_id;
    
    // Update the job
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...jobData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('recruiter_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/jobs/:id - Delete a job
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get job ID from URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check if the job exists and belongs to the user
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('recruiter_id', userId)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    // Delete the job
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('recruiter_id', userId);

    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}