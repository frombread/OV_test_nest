import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import Participant from './Participant';

const App = () => {
  const [rooms, setRooms] = useState([]);
  const [participants, setParticipants] = useState([]);
  const sessionRef = React.useRef(null);
  const publisherRef = React.useRef(null);
  const videoRef = React.useRef(null);

  // OpenVidu 객체 초기화
  const OV = new OpenVidu();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:3000/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleError = (error) => {
    console.error('Error accessing media devices:', error);
  };

  const handleJoinRoom = async (room) => {
    try {
      await startWebcam();
      const response = await axios.post('http://localhost:3000/sessions', {
        sessionName: room,
      });
      const sessionId = response.data;
      sessionRef.current = sessionId;

      // OpenVidu Publisher 생성
      const publisher = OV.initPublisher('publisher', {
        videoSource: videoRef.current, // Use the selected video stream
        audioSource: undefined, // default microphone
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
      });
      publisherRef.current = publisher;

      // OpenVidu에 연결 및 스트림 추가
      const session = OV.initSession();
      const tokenResponse = await axios.post(`http://localhost:3000/sessions/${sessionId}/connections`, {
        data: 'user-data',
      });
      const token = tokenResponse.data;
      session.connect(token, (error) => {
        if (error) {
          console.error('Error connecting to session:', error);
        } else {
          session.publish(publisher);
        }
      });

      // 이벤트 리스너 등록
      session.on('streamCreated', (event) => {
        const subscriber = session.subscribe(event.stream, 'subscribers', {
          insertMode: 'APPEND',
        });
        setParticipants((prevParticipants) => [...prevParticipants, subscriber]);
      });

      session.on('streamDestroyed', (event) => {
        setParticipants((prevParticipants) =>
            prevParticipants.filter((p) => p.stream.streamId !== event.stream.streamId)
        );
      });
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      handleError(error);
    }
  };

  return (
      <div>
        <h1>Video Chat App</h1>
        <ul>
          {rooms.map((room) => (
              <li key={room} onClick={() => handleJoinRoom(room)}>
                {room}
              </li>
          ))}
        </ul>
        <div id="publisher">
          <video ref={videoRef} autoPlay playsInline />
        </div>
        <div id="subscribers">
          {participants.map((stream, index) => (
              <Participant key={index} stream={stream} />
          ))}
        </div>
      </div>
  );
};

export default App;
