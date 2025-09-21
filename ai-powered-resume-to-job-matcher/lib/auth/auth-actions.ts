'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/db/supabase';

export async function signIn(formData: FormData) {
  const supabase = createClient();

  // Get email and password from form data
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const supabase = createClient();

  // Get form data
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const userType = formData.get('userType') as string;

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        user_type: userType,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  // Store user profile data in Supabase
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: data.user?.id,
        email,
        name,
        user_type: userType,
      },
    ]);

  if (profileError) {
    return {
      error: profileError.message,
    };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return {
      error: error.message,
    };
  }
  
  redirect('/');
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
}