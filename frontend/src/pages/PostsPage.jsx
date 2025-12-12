import PostsPageComponent from "../components/PostsPageComponent";
import { useAuth } from "../Auth/AuthHook";
import { useQueryClient } from "@tanstack/react-query";
import { LogoutFetchData } from "../util/http";
import { useNavigate } from "react-router-dom";
import Post from "../components/Post";
export default function PostsPage() {

    const { user, isLoading } = useAuth();
    const queryClient = useQueryClient();
    const navigate=useNavigate()

    if (isLoading) {
        return <h1>Loading...</h1>
    }

    if (!user) {
        return <h1>No user logged in</h1>;
    }

    

async function handleLogout() {
    await LogoutFetchData();

    
    queryClient.invalidateQueries(["user"]);

    
    queryClient.setQueryData(["user"], null);

    
    navigate("/");
}

    return (
        <>
            <Post />
            <Post />
            <Post />
            <Post />
            <Post />
            <Post />
        </>
    );
}
