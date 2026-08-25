import { createSSRServerClient } from '@/lib/supabase/ssrServer';
import { DiscountCodesSection } from './DiscountCodesSection';

interface DiscountCodesSectionWrapperProps {
  feedbackHref: string;
}

export async function DiscountCodesSectionWrapper({
  feedbackHref,
}: DiscountCodesSectionWrapperProps) {
  // Resolve the token first; the JSX return stays out of the try/catch so a
  // render is never what the catch is guarding (react-hooks/error-boundaries).
  let userToken: string | null = null;
  try {
    const supabase = await createSSRServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    userToken = session?.access_token || null;
  } catch (error) {
    console.error('Error getting session for discount codes:', error);
  }

  return <DiscountCodesSection userToken={userToken} feedbackHref={feedbackHref} />;
}
