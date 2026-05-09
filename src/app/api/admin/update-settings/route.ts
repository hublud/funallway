import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      weekly_sub_price, 
      monthly_sub_price, 
      connection_fee, 
      header_ad_url, 
      header_ad_caption, 
      footer_ad_url, 
      footer_ad_caption,
      slider_items
    } = body;

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("platform_settings")
      .upsert({
        id: "global",
        weekly_sub_price,
        monthly_sub_price,
        connection_fee,
        header_ad_url,
        header_ad_caption,
        footer_ad_url,
        footer_ad_caption,
        slider_items,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Settings Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Platform settings updated successfully" 
    });

  } catch (err: any) {
    console.error('Settings Update Internal Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
