import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { formatPhoneNumberForDb } from '@/utils/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      password, 
      name, 
      username,
      age,
      state,
      locationType,
      gender,
      profileImage,
      galleryImages,
      plan,
      bio,
      whatsappNumber,
      rates,
      interests,
      canTravelTo
    } = body;

    const supabase = createAdminClient();

    // 1. Create the Auth User with confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      console.error('Auth Creation Error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Calculate subscription expiry
    const now = new Date();
    let expiresAt = new Date();
    if (plan === 'weekly') {
      expiresAt.setDate(now.getDate() + 7);
    } else {
      expiresAt.setDate(now.getDate() + 31);
    }

    // 3. Create the Profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      name,
      username,
      age,
      state,
      location_type: locationType,
      gender,
      profile_image: profileImage,
      gallery_images: galleryImages,
      is_featured: false,
      is_subscribed: true,
      status: "active",
      subscription_expires_at: expiresAt.toISOString(),
      plan,
      bio,
      whatsapp_number: formatPhoneNumberForDb(whatsappNumber),
      can_travel_to: canTravelTo || [],
      rates,
      interests
    });

    if (profileError) {
      console.error('Profile Creation Error:', profileError);
      // Optional: Cleanup the auth user if profile fails
      // await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      userId,
      message: "Model manually onboarded successfully" 
    });

  } catch (err: any) {
    console.error('Manual Onboarding Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
