import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// GET /api/resume - Get all resumes for the current user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all resumes for the user
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes:', error);
      return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
    }

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error in GET /api/resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/resume - Upload a new resume
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
    
    // Parse form data
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    
    if (!resumeFile) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resumeFile.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' }, { status: 400 });
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (resumeFile.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = resumeFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `resumes/${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, resumeFile);

    if (uploadError) {
      console.error('Error uploading resume:', uploadError);
      return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    // Store resume metadata in database
    const { data: resumeData, error: dbError } = await supabase
      .from('resumes')
      .insert([
        {
          user_id: userId,
          file_name: resumeFile.name,
          file_path: filePath,
          file_url: publicUrl,
          file_type: resumeFile.type,
          file_size: resumeFile.size,
          status: 'uploaded', // Initial status
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error storing resume metadata:', dbError);
      // Try to delete the uploaded file if metadata storage fails
      await supabase.storage.from('resumes').remove([filePath]);
      return NextResponse.json({ error: 'Failed to store resume metadata' }, { status: 500 });
    }

    // TODO: Trigger resume analysis in background
    // This would be implemented with a background job or serverless function

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error('Error in POST /api/resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/resume/:id - Delete a resume
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
    
    // Get resume ID from URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Get resume data to check ownership and get file path
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: 'Resume not found or access denied' }, { status: 404 });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('resumes')
      .remove([resume.file_path]);

    if (storageError) {
      console.error('Error deleting resume file:', storageError);
      // Continue anyway to delete the database record
    }

    // Delete resume record from database
    const { error: dbError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (dbError) {
      console.error('Error deleting resume record:', dbError);
      return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}