import React, { useEffect, useRef } from 'react';

const Participant = ({ stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            const videoElement = videoRef.current;
            videoElement.srcObject = stream.stream;
        }
    }, [stream]);

    return <video ref={videoRef} autoPlay playsInline />;
};

export default Participant;
