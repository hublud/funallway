import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const age = parseInt(formData.get('age') as string) || 18;
    const gender = formData.get('gender') as string;
    const baseState = formData.get('baseState') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const bio = formData.get('bio') as string;
    const plan = formData.get('plan') as string;
    const travelStates = JSON.parse(formData.get('travelStates') as string);
    const interests = JSON.parse(formData.get('interests') as string);
    const rates = JSON.parse(formData.get('rates') as string);

    const coverPhoto = formData.get('coverPhoto') as File | null;
    const galleryPhotos = formData.getAll('galleryPhotos') as File[];

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

    // 2. Upload Images
    let profileImageUrl = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop";
    let galleryImageUrls: string[] = [];

    if (coverPhoto && coverPhoto.size > 0) {
      const arrayBuffer = await coverPhoto.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const ext = coverPhoto.name.split('.').pop() || 'jpg';
      const path = `${userId}/cover-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('profiles').upload(path, buffer, {
        contentType: coverPhoto.type || 'image/jpeg',
      });
      if (!upErr) {
        profileImageUrl = supabase.storage.from('profiles').getPublicUrl(path).data.publicUrl;
      }
    }

    if (galleryPhotos && galleryPhotos.length > 0) {
      for (let i = 0; i < galleryPhotos.length; i++) {
        const file = galleryPhotos[i];
        if (file.size > 0) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const ext = file.name.split('.').pop() || 'jpg';
          const path = `${userId}/gallery-${Date.now()}-${i}.${ext}`;
          const { error: upErr } = await supabase.storage.from('profiles').upload(path, buffer, {
            contentType: file.type || 'image/jpeg',
          });
          if (!upErr) {
            galleryImageUrls.push(supabase.storage.from('profiles').getPublicUrl(path).data.publicUrl);
          }
        }
      }
    }

    // 3. Insert Profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      name: username,
      username: username,
      age,
      state: baseState,
      location_type: 'national',
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
