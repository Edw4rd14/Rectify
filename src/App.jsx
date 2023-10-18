import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import Plot from "react-plotly.js";

const CLIENT_ID = import.meta.env.VITE_REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_REACT_APP_SPOTIFY_CLIENT_SECRET;

const App = () => {
  const [formData, setFormData] = React.useState({
    playlistURL:"",
    limit: 10
  });
  const [errMsg, setErrMsg] = React.useState("");
  const [artists,setArtists] = React.useState("");
  const [token,setToken] = React.useState("");
  const [playlist, setPlaylist] = React.useState([]);
  const [artistCount, setArtistCount] = React.useState([]);
  const [recommendations,setRecommendations] = React.useState([]);
  const [refresh, setRefresh] = React.useState(false)
  const [artistPlot, setArtistPlot] = React.useState([]);
  const handleChange = (e) => {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [e.target.name]: e.target.value,
      };
    });
  };
  useEffect(()=>{
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
      setRecommendations(response.data.tracks.map((track)=>({...track})))
      setRefresh(true)
      setErrMsg("");
    });
  },[artists])
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
        setToken(response.data.access_token);
      })
      .catch((error) => {
        setErrMsg("An error occurred. Please refresh the page and try again");
      });
  },[]);
  const handleSubmit = async (e) => {
    e.preventDefault()
    var playlistID = formData.playlistURL.split("?si=")[0];
    playlistID = playlistID.split("/")[4]
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
      setPlaylist([{"name":response.data.name, "owner":response.data.owner.display_name, "imgurl":response.data.images[0].url}])
      const getRandomValues = (array, count) => {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };
      let artistIDs = []; 
      let artistNames = [];
      let noOfLoops = Math.ceil((response.data.tracks.total-100)/100); // if noloops = 0 bs
      let tracks = response.data.tracks.items;
      for (let x=0;x<tracks.length;x++) {
        artistIDs.push(tracks[x].track.artists[0])
        for(let y=0;y<tracks[x].track.artists.length;y++) {
          artistNames.push(tracks[x].track.artists[y].name)
        } 
      }
      for(let z=1;z<noOfLoops;z++) {
        const playlistInfoParam = {
          method: "get",
          url:`https://api.spotify.com/v1/playlists/${playlistID}`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            offset: z*100
          }
        }
        axios(playlistInfoParam)
        .then((response)=>{
          let tracks = response.data.tracks.items;
          for (let x=0;x<tracks.length;x++) {
            artistIDs.push(tracks[x].track.artists[0])
            for(let y=0;y<tracks[x].track.artists.length;y++) {
              artistNames.push(tracks[x].track.artists[y].name)
            } 
            // refresh runs handleSubmit, save playlist link, show current playlist header
          }
        })
      }
      const counter = {};
      artistNames.forEach(ele => {
        if (counter[ele]) {
            counter[ele] += 1;
        } else {
            counter[ele] = 1;
        }
      });
      const finalArtists = [];
      const count = [];
      for (var key in counter) {
        finalArtists.push(finalArtists)
        count.push(counter[key])
      }
      setArtistCount(counter)
      const uniqueArtist = [...new Set(artistIDs.map((item)=> item.id))]
      const randomArtists = getRandomValues(uniqueArtist,5);
      setArtists(randomArtists.join(","))
    })
    .catch((err)=>{
      setErrMsg("An error occurred. Please check the playlist URL and try again.");
    });
  };
  return (
    <>
      <div className='font-poppins w-full flex flex-col min-h-screen'>
        <header className='bg-[#181c1c] text-white overflow-hidden font-bold flex justify-right items-center text-2xl h-14'>
          <h1 className='px-5'>REC<span className='text-[#20d464]'>TIFY</span></h1>
        </header>
        <main className='grow'>
          <div className='text-center mt-12'>
            <h1 className='font-extrabold text-2xl uppercase'>Spotify Song Recommendations</h1> 
            <p>Songs will be recommended to you based on your playlist inserted below.</p>
          </div>
          <div className='flex justify-center mt-10'>
            <input type='text' placeholder='Enter playlist URL here' className='w-1/2 h-8 rounded p-2' value={formData.playlistURL} name="playlistURL" onChange={handleChange}/>
            <input type='submit' className='mx-4 bg-[#343341] text-center text-white px-2 rounded uppercase font-bold h-8 hover:text-black hover:bg-white' onClick={handleSubmit}/>
          </div>
          <p className='text-lg text-rose-700 text-center mt-2 mb-10'>{errMsg}</p>
          <hr className='border-[#181c1c] border-2 w-5/6 mx-auto mb-4'/>
          <div>
            {
              playlist.map((info,key)=>{
                return(
                  <>
                  <h2 className='font-bold text-center'>CURRENT PLAYLIST:</h2>
                    <div className='w-1/5 bg-[#121212] rounded mx-auto text-center'>
                      <div className='divide-gray-500 divide-y'>
                        <img src={info.imgurl} className='w-3/4 mt-4 pt-4 mx-auto'/>
                        <div className='mx-4 mt-2 text-white'>{info.name}</div>
                      </div>
                      <div className='text-[#a2a2a2] mb-3 w-5/6 mx-auto pb-4'>{info.owner}</div>
                    </div>
                  </>
                )
              })
            }
          </div>
          <div className='grid lg:grid-cols-5 gap-6 p-4 w-3/4 mb-8 mx-auto text-center grid-cols-2'>
            {
              recommendations && recommendations.map((track,key)=>{
                const trackartists = [];
                for(let x=0;x<track.artists.length;x++) {
                  trackartists.push(track.artists[x].name);
                };
                return(
                  <a href={track.external_urls.spotify} target="_blank" className='bg-[#121212] rounded' key={key}>
                    <div>
                      <div className='divide-gray-500 divide-y'>
                        <img src={track.album.images[0].url} className='w-3/4 mt-4 mx-auto'/>
                        <div className='mx-4 mt-2 text-white'>{track.album.name}</div>
                      </div>
                      <div className='text-[#a2a2a2] mb-3 w-5/6 mx-auto'>{trackartists.join(", ")}</div>
                    </div>
                  </a>
                );
              })
            }
          </div>
          <div>
            {
              refresh ? 
              <div className='mx-auto bg-[#343341] rounded w-fit text-white p-2 hover:text-black hover:bg-white font-bold'>
                <button onClick={handleSubmit}>REFRESH</button>
              </div>
              :
              <div></div>
            }
          </div>
          {/* <Plot
            data={[
              {
                labels: artistCount[0],
                values: artistCount[1],
                type:'pie'
              },
            ]}
            layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
          /> */}
        </main>
        <footer className='h-14 bg-[#181c1c] uppercase font-bold text-white flex justify-center align-center'>
          <a href="https://github.com/edw4rd14" target='_blank' className='my-auto'>© 2023 Edward Tan | All rights reserved.</a>
        </footer>
      </div>
    </>
  )
}

export default App;