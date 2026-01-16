import { supabaseServer } from "@/lib/supabaseServer";

export async function saveUserToSupabase(user: any) {
    if (!user?.email) return;

    try {

        const { data: existingUser, error: findError } = await supabaseServer
            .from("app_users")
            .select("*")
            .eq("email", user.email)
            .single();

        if (!existingUser) {

            const { data, error: insertError } = await supabaseServer
                .from("app_users")
                .insert({
                    email: user.email,
                    password: null,
                    created_at: new Date(), 
                });

            if (insertError) {
                console.error("Error inserting user into Supabase:", insertError);
            } else {
                console.log("User inserted into Supabase:", user.email);
            }
        }   else {
            console.log("User already exists in Supabase:", user.email);
        }
    } catch (err) {
        console.error("Supabase error:", err);
    }
}
