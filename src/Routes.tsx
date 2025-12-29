import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import LandingPageContainer from "./Landing-page-container"; 
import AddSong from "./AddSong";
import SongsLinkTreeMenu from "./SongsMenu";


const AppRoutes = () => {
    const navigate = useNavigate()
    

    return (
        <Routes>
          <Route path = "alexpink/songs/:id" element={<LandingPageContainer />} />
          <Route path = "addsong" element={<AddSong />} />
            <Route path = "alexpink/songs" element={<SongsLinkTreeMenu />} />
        </Routes>
    )

}
export default AppRoutes