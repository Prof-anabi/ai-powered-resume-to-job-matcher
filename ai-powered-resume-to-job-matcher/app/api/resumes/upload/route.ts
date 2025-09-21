import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getCollection } from '@/lib/db/mongodb';
import { analyzeResume } from '@/lib/ai/gemini';

/**
 * API route for uploading and analyzing resumes
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file to Supabase:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload resume' },
        { status: 500 }
      );
    }

    // Get file URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Extract text from resume (in a real app, you'd use a PDF parser)
    // For this example, we'll simulate with a placeholder
    const resumeText = 'Sample resume text for demonstration purposes';

    // Analyze resume with Gemini AI
    const analysis = await analyzeResume(resumeText);

    // Store resume metadata in Supabase
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: fileName,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (resumeError) {
      console.error('Error storing resume metadata:', resumeError);
      return NextResponse.json(
        { error: 'Failed to store resume metadata' },
        { status: 500 }
      );
    }

    // Store resume analysis in MongoDB
    const resumesCollection = await getCollection('resumes', 'analyses');
    await resumesCollection.insertOne({
      resumeId: resumeData.id,
      userId,
      analysis,
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: resumeData.id,
      fileName: file.name,
      fileUrl: urlData.publicUrl,
      analysis,
    });
  } catch (error) {
    console.error('Error processing resume upload:', error);
    return NextResponse.json(
      { error: 'Failed to process resume upload' },
      { status: 500 }
    );
  }
}