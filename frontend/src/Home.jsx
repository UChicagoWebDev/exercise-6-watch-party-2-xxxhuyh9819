import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/home.css';
import TopBar from "./topBar";

function Home({LoginCredentials}) {

    const api_key = localStorage.getItem("yunhaohu_belay_api_key")
    let username = localStorage.getItem("user_name");

    const navigate = useNavigate()
    const [totalChannels, setTotalChannels] = useState(0);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [channels, setChannels] = useState([])
    const [channelName, setChannelName] = useState()
    const [messages, setMessages] = useState()

    const baseUrl = "http://127.0.0.1:5000"

    // src: https://stackoverflow.com/questions/63605682/reactjs-call-function-on-startup-of-application-with-a-functional-component
    useEffect(() => {
        getChannels();
        // getMessagesByChannel(selectedChannelId)
        setInterval(()=>getChannels(), 1000);
        // setInterval(()=>getMessagesByChannel(selectedChannelId), 500);
    }, []);

    function getChannels() {
        fetch(baseUrl +'/api/channels', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => response.json())
            .then(data => {
                setChannels(data)
                console.log(data)
            }).catch(error => console.log(error))
    }

    function handleCreateChannel() {

    }

    function handleSelectedChannel(channel) {
        setSelectedChannel(channel)
        // getMessagesByChannel(channel.id)
        console.log(selectedChannel)
        navigate(`/channel/${channel.id}`)
    }


    return <div className="home">

        <TopBar LoginCredentials={LoginCredentials} username={username}/>

        <div className="main-content">
            {/*<ChannelDetails numOfChannels={totalChannels} selectedChannel={selectedChannel} />*/}
            <div className="channels-list">
                <div className="title_block">
                    <div className="title">
                        <h2>Channels</h2>
                        <button onClick={handleCreateChannel}>Create Channel</button>
                    </div>
                    <input type="text"
                           id="channel_name"
                           name="channel_name"
                           placeholder="Enter the new channel's name"
                           value={channelName}
                           onChange={(e) => {
                               setChannelName(e.target.value)
                           }}
                           required/>
                </div>
                <ul>
                    {channels.map((data) => {
                        return (
                            <li
                                key={data.id}
                                onClick={() => handleSelectedChannel(data)}
                                className={selectedChannel !== null && data.id === selectedChannel.id ? "selected": "other"}>
                                {data.name}
                            </li>
                        )
                    })}
                </ul>

            </div>

            <div className="channel-messages">
                <div className="channel-details">
                    <span>{selectedChannel ? `#${selectedChannel.name}` : "Click to enter a channel!"}</span>

                    {/*<ul>*/}
                    {/*    {messages.map((message) => {*/}
                    {/*        return (*/}
                    {/*            <li*/}
                    {/*                key={message.id}>*/}
                    {/*                {message.body}*/}
                    {/*                /!*{message.id}*!/*/}
                    {/*            </li>*/}
                    {/*        )*/}
                    {/*    })}*/}
                    {/*    <li>{messages[0].body}</li>*/}
                    {/*</ul>*/}

                </div>

            </div>

            <div className="message-replies">
                <h1>Replies</h1>
            </div>

        </div>


    </div>
}

export default Home