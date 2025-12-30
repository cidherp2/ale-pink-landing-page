import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "./ClientSupabase";
const AuthGuard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching user session:", error);
                navigate("/login");
            } else {
                setUser(data?.session?.user || null);
                setLoading(false);
                if (location.pathname === "/login") {
                    navigate("/alexpink/songs");
                }
                console.log("hay usuario")
                if (!data?.session?.user) {
                    navigate("/login");
                }
            }
        };
        checkUser();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? <Outlet /> : null;
};

export default AuthGuard;
