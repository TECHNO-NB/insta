import React, { useState, useEffect, useContext } from "react";
import "./PrivatemsgChat.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { LoginContext } from "../context/LoginContext";
import alertSound from "../img/alert.m4a";

const PrivatemsgChat = (props) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const {message,setMessage}=useContext(LoginContext);

  const { user } = useParams();
  const userId = localStorage.getItem("userId");

  const socket = io("http://localhost:5000", {
    query: {
      userId: userId,
    },
  });

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const sendMessageToServer = (message) => {
    socket.emit("sendmsg", { user: user, message: `Other:${message}` });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      setMessages([...messages, { text: `You:${inputValue}`, sender: "user" }]);
      sendMessageToServer(inputValue);
      setInputValue("");
    }
  };

  useEffect(() => {
    socket.on("servermsg", (msg) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: msg, sender: "other" },
      ]);
      const newAudio = new Audio(alertSound);
      newAudio.play();
      setMessage(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, handleSendMessage]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.sender === "user" ? "user" : "other"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={handleInputChange}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default PrivatemsgChat;
