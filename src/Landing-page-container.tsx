import styled from "styled-components";
import LinkButtons from "./utils/Link-buttons";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/ClientSupabase";
import type { Database } from "./supabase/Database";
import { type Tables } from "./supabase/Database";
import { useParams } from "react-router-dom";


const Container = styled.div `
width: 100%;
background: #0d6649;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
min-height: 100vh;
gap:1rem;
`
type SongWithLinks = Tables<"songs"> & {
  song_links: Tables<"song_links">[];
};
const LandingPageContainer = () => {

    const [songLink,setSongLink] = useState<string>("")
    const [songs, setSongs] = useState<SongWithLinks[]>([])
    const [platform, setPlatform] = useState<string>("")
    const [songTitle, setSongTitle] = useState<string>("")
    const urlParams = new URLSearchParams(window.location.search);
    //const songIdParam = urlParams.get('myParam');
    const { id } = useParams();

    const fetchSongs = async (songId:string) => {
        try{
            const { data, error } = await supabase
            .from("songs")
            .select("* ,song_links(*)")
            .eq("id", songId)

            if (error) {
                console.log("Error fetching songs: ", error)
            }
            if (data){
                console.log("Fetched songs: ", data)
                setSongs(data)
            }
           
        }
        catch (error){
            console.log("Error fetching songs ", error)
        }
    }

    useEffect(() =>{
        if (id){
        fetchSongs(id);
        }
    },[])
    return (
        <div style={{width:"100%"}}>
        <Container>
            {songs[0]?.song_links.map((link,index)=>{
                return(
                    <LinkButtons
                    songLink={link.url}
                    platform={link.platform}
                    songTitle={songs[0].title}
                    coverUrl={songs[0]?.cover_url ?? ""}
                    >
                    </LinkButtons>
                )
            })}
        </Container>
        </div>
    );
}

export default LandingPageContainer;