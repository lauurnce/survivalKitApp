import { createSSRServerClient } from '@/lib/supabase/ssrServer';
import { DiscountCodesSection } from './DiscountCodesSection';

export async function DiscountCodesSectionWrapper() {
  try {
    const supabase = await createSSRServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    const userToken = session?.access_token || null;

    return <DiscountCodesSection userToken={userToken} />;
  } catch (error) {
    console.error('Error getting session for discount codes:', error);
    return <DiscountCodesSection userToken={null} />;
  }
}
