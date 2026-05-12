import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  isAdmin: false,
  isStaff: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(async () => {
          const [{ data: adminRow }, { data: staffRow }] = await Promise.all([
            supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", sess.user.id)
            .eq("role", "admin")
              .maybeSingle(),
            supabase
              .from("staff_members")
              .select("user_id")
              .eq("user_id", sess.user.id)
              .maybeSingle(),
          ]);
          setIsAdmin(!!adminRow);
          setIsStaff(!!staffRow);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsStaff(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      if (sess?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", sess.user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data }) => setIsAdmin(!!data));
        supabase
          .from("staff_members")
          .select("user_id")
          .eq("user_id", sess.user.id)
          .maybeSingle()
          .then(({ data }) => setIsStaff(!!data));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isStaff, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
