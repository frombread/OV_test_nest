import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { OpenVidu, Publisher } from 'openvidu-browser';
import Participant from './Participant';
import RoomList from "./components/RoomList";

const App = () => {
  const [rooms, setRooms] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const sessionRef = useRef(null);
  const publisherRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

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

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        handleError(error);
      }
    };

    startWebcam();
  }, []);

  const handleJoinRoom = async (room) => {
    setSelectedRoom(room);
  };

  useEffect(() => {
    const joinSession = async () => {
      try {
        if (!selectedRoom) return;

        // 이미 생성된 세션이 있는지 확인
        if (!sessionRef.current) {
          // 세션 생성
          const response = await axios.post('http://localhost:3000/sessions', {
            sessionName: selectedRoom,
          });
          const sessionId = response.data;
          sessionRef.current = sessionId;
        }

        // OpenVidu Publisher 생성
        const publisher = OV.initPublisher('publisher', {
          audioSource: undefined, // default microphone
          videoSource: mediaStreamRef.current, // use the user's webcam stream
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
        });
        publisherRef.current = publisher;

        // OpenVidu에 연결 및 스트림 추가
        const session = OV.initSession();
        const tokenResponse = await axios.post(`http://localhost:3000/sessions/${sessionRef.current}/connections`, {
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

    joinSession();
  }, [selectedRoom]);

  return (
      <div>
        <h1>Video Chat App</h1>
        <RoomList rooms={rooms} handleJoinRoom={handleJoinRoom} />
        <div id="publisher"></div>
        <div id="subscribers">
          {participants.map((stream, index) => (
              <Participant key={index} stream={stream} />
          ))}
        </div>
        <div id="webcam-stream">
          {/* 카메라 스트림 확인을 위한 비디오 요소 */}
          <video ref={videoRef} autoPlay playsInline />
        </div>
      </div>
  );
};

export default App;
