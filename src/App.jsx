import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';

const CLIENT_ID = SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = SPOTIFY_CLIENT_SECRET;

const App = () => {
  const [formData, setFormData] = React.useState({
    playlistURL:""
  });
  const [artists,setArtists] = React.useState("");
  const [token,setToken] = React.useState("");
  const [recommendations,setRecommendations] = React.useState([]);
  const handleChange = (e) => {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [e.target.name]: e.target.value,
      };
    });
  };
  useEffect(()=>{
    const authParams = {
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    };
    axios(authParams)
      .then((response) => {
        console.log(response.data);
        setToken(response.data.access_token);
      })
      .catch((error) => {
        console.error(error);
      });
  },[]);
  const handleSubmit = async (e) => {
    const getRandomValues = (array, count) => {
      const shuffled = array.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    e.preventDefault()
    var playlistID = formData.playlistURL.split("?si=")[0];
    playlistID = playlistID.split("/")[4]
    console.log(playlistID)
    console.log(token)
    const playlistInfoParam = {
      method: "get",
      url:`https://api.spotify.com/v1/playlists/${playlistID}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    // const {data} = await axios.get("https://api.spotify.com/v1/playlists/" + id,{headers:{"Content-Type":"application/json",'Authorization': "Bearer " + token}}).then(result=>result.json()).then(data=>console.log(data))
    axios(playlistInfoParam)
    .then((response)=>{
      let tracks = response.data.tracks.items;
      let artistIDs = []; 
      for (let x=0;x<tracks.length;x++) {
        artistIDs.push(tracks[x].track.artists[0])
      }
      const uniqueArtist = [...new Set(artistIDs.map((item)=> item.id))]
      const randomArtists = getRandomValues(uniqueArtist,5);
      setArtists(randomArtists.join(","))
    })
    .catch((err)=>{
      console.log(err);
    })
    const recommendationParam = {
      method: 'get',
      url:"https://api.spotify.com/v1/recommendations",
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        seed_artists: artists,
        limit:10
      }
    }
    axios(recommendationParam)
    .then(response=>{
      console.log(response)
      setRecommendations(response.data.tracks.map((track)=>({...track})))
      console.log(recommendations)
    })
  };
  return (
    <>
      <div className='font-poppins w-full flex flex-col min-h-screen'>
        <header className='bg-[#181c1c] text-white overflow-hidden font-bold flex justify-right items-center text-2xl h-14'>
          <h1 className='px-5'>REC<span className='text-[#20d464]'>TIFY</span></h1>
        </header>
        <main className='grow'>
          <div className='text-center mt-10'>
            <h1 className='font-extrabold text-2xl uppercase'>Spotify Song Recommendations</h1>
            <p>Songs will be recommended to you based on your playlist inserted below. </p>
          </div>
          <div className='flex justify-center mt-10 mb-10'>
            <input type='text' placeholder='Enter playlist URL here' className='w-1/3 h-8 rounded' value={formData.playlistURL} name="playlistURL" onChange={handleChange}/>
            <input type='submit' className='mx-4 bg-[#343341] text-center text-white px-2 rounded border-2 border-white uppercase font-bold h-8 hover:text-black hover:bg-white' onClick={handleSubmit}/>
          </div>
          <hr className='border-[#181c1c] border-2 w-5/6 mx-auto mb-8'/>
          <div className='grid grid-cols-5 gap-6 p-4 w-3/4 mb-8 mx-auto text-center'>
            {
              recommendations && recommendations.map((track,key)=>{
                const trackartists = [];
                for(let x=0;x<track.artists.length;x++) {
                  trackartists.push(track.artists[x].name);
                }
                return(
                  <a href={track.external_urls.spotify} target="_blank" className='bg-[#121212] rounded'>
                    <div>
                      <div className='divide-gray-500 divide-y'>
                        <img src={track.album.images[0].url} className='w-3/4 mt-4 mx-auto'/>
                        <div className='mx-4 mt-2 text-white'>{track.album.name}</div>
                      </div>
                      <div className='text-[#a2a2a2] mb-3 w-5/6 mx-auto'>{trackartists.join(", ")}</div>
                    </div>
                  </a>
                )
              })
            }
          </div>
        </main>
        <footer className='h-14 bg-[#181c1c] uppercase font-bold text-white flex justify-center align-center'>
          <a href="https://github.com/edw4rd14" target='_blank' className='my-auto'>© 2023 Edward Tan | All rights reserved.</a>
        </footer>
      </div>
    </>
  )
}

export default App;