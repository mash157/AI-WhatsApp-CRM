import React from 'react';

const ChatMessage = ({ message, isUser }) => {
  const text = typeof message === 'string' ? message : (message.text || message.content || '');
  
  const containerClass = 'flex w-full mb-4 ' + (isUser ? 'justify-end' : 'justify-start');
  const bubbleClass = 'max-w-[75%] rounded-lg px-4 py-2 shadow-sm ' + (isUser ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none');

  return (
    <div className={containerClass}>
      <div className={bubbleClass}>
        <p className='text-sm leading-relaxed'>{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
