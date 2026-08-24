import { createSSRServerClient } from '@/lib/supabase/ssrServer';
import { DiscountCodesSection } from './DiscountCodesSection';

interface DiscountCodesSectionWrapperProps {
  feedbackHref: string;
}

export async function DiscountCodesSectionWrapper({
  feedbackHref,
}: DiscountCodesSectionWrapperProps) {
  try {
    const supabase = await createSSRServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    const userToken = session?.access_token || null;

    return <DiscountCodesSection userToken={userToken} feedbackHref={feedbackHref} />;
  } catch (error) {
    console.error('Error getting session for discount codes:', error);
    return <DiscountCodesSection userToken={null} feedbackHref={feedbackHref} />;
  }
}
