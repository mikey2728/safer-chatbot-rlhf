import { supabase } from "@/integrations/supabase/client";

export const makeUserAdmin = async (userId: string) => {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'admin',
    });

  if (error && !error.message.includes('duplicate')) {
    console.error('Error granting admin role:', error);
    throw error;
  }

  return true;
};

// Call this function in the browser console with your user ID to grant admin access
// Example: await makeUserAdmin('your-user-id-here')
(window as any).makeUserAdmin = makeUserAdmin;