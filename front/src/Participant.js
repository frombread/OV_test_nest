import React, { useEffect, useRef } from 'react';

const Participant = ({ stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream.stream;
        }
    }, [stream]);

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline />
        </div>
    );
};

export default Participant;
