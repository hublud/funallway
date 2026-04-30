import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { formatPhoneNumberForDb } from '@/utils/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      username,
      age,
      gender,
      baseState,
      locationType,
      whatsapp,
      bio,
      plan,
      travelStates,
      interests,
      rates
    } = body;

    const supabase = createAdminClient();

    // 1. Create the Auth User with confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: username }
    });

    if (authError) {
      console.error('Auth Creation Error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert minimal Profile (Images will be handled by the client after login)
    // We add placeholders in case the client fails to upload
    const profileImageUrl = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop";
    const galleryImageUrls: string[] = [];

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      name: username,
      username: username,
      age: parseInt(age) || 18,
      state: baseState,
      location_type: locationType || 'national',
      gender,
      profile_image: profileImageUrl,
      gallery_images: galleryImageUrls,
      is_featured: false,
      is_subscribed: false,
      status: "pending",
      plan,
      bio,
      whatsapp_number: whatsapp,
      can_travel_to: travelStates || [],
      rates,
      interests
    });

    if (profileError) {
      console.error('Profile Creation Error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      userId,
      message: "Model registered successfully" 
    });

  } catch (err: any) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
