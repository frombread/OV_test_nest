// src/components/RoomList.js

import React from 'react';

const RoomList = ({ rooms, handleJoinRoom }) => {
    return (
        <div>
            <h2>Room List</h2>
            <ul>
                {rooms.map((room) => (
                    <li key={room} onClick={() => handleJoinRoom(room)}>
                        {room}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RoomList;
