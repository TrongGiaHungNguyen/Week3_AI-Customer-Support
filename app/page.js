// 'use client'
// import { Box, Stack, TextField, Button } from "@mui/material";
// import Image from "next/image";
// import {useState} from 'react'

// export default function Home() {
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: 'Hi! I am the Headstarter Support Agent, how can I assist you today?',
//     },
//   ]);

//   const [message, setMessage] = useState('');

//   const sendMessage = async () =>{
//     setMessage('')
//     setMessages((messages) => [
//       ...messages,
//       {role: 'user', content: message},
//       {role: 'assistant', content: ''},
//     ]);

//     const response = fetch('/api/chat', {
//       method: 'POST',
//       headers:{
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify([...messages, {role: 'user', content: message}]),
//     }).then(async(res) => {
//       const reader = res.body.getReader()
//       const decoder = new TextDecoder()

//       let result = ''
//       return reader.read().then(function processText({done, value}){
//         if (done){
//           return result;
//         }
//         const text = decoder.decode(value || new Uint8Array(), {stream: true});
//         setMessages((messages) => {
//           let lastMessage = messages[messages.length - 1]
//           let otherMessages = messages.slice(0, messages.length - 1)

//           // console.log([
//           //   ...otherMessages,
//           //   {
//           //     ...lastMessage,
//           //     content: lastMessage.content + text,
//           //   },
//           // ])

//           return ([
//             ...otherMessages,
//             {
//               ...lastMessage,
//               content: lastMessage.content + text,
//             },
//           ]);
//         });
//         return reader.read().then(processText)
//       })
//     })
//   }

//   return (
//     <Box 
//       width="100vw" 
//       height="100vh" 
//       display="flex" 
//       flexDirection="column"
//       justifyContent="center"
//       alignItems="center"
//     >
//       <Stack
//         direction="column"
//         width="600px"
//         height="700px"
//         border="1px solid black"
//         p={2}
//         spacing={3}
//       >
//         <Stack
//           direction="column"
//           spacing={2}
//           flexGrow={1}
//           overflow="auto"
//           maxHeight="100%"
//         >
//           {
//             messages.map((message, index) => (
//               <Box 
//                 key={index}
//                 display="flex"
//                 justifyContent={
//                   message.role === 'assistant' ? 'flex-start' : 'flex-end'
//                 }
//               >
//                 <Box 
//                   bgcolor={
//                     message.role === 'assistant' ? 'primary.main' : 'secondary.main'
//                   }
//                   color="white"
//                   borderRadius={16}
//                   p={3}
//                 >
//                   {message.content}
//                 </Box>
//               </Box>
//             ))
//           }
//         </Stack>

//         <Stack direction = "row" spacing = {2}>
//           <TextField
//             label = "message"
//             fullWidth
//             value = {message}
//             onChange = {(e) => setMessage(e.target.value)}
//           />
          
//           <Button variant = "contained" onClick = {sendMessage}>
//             Send
//           </Button>

//         </Stack>
//       </Stack>
//     </Box>
//   )
// }


'use client'
import { Box, Stack, TextField, Button, Typography, Paper } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am the Headstarter Support Agent. How can I assist you today?',
    },
  ]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (!message.trim()) return;  // Prevent sending empty messages
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    await reader.read().then(function processText({ done, value }) {
      if (done) return result;
      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);

        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });
      return reader.read().then(processText);
    });
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
      p={2}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 600,
          height: 700,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6">
            Headstarter Support Agent
          </Typography>
        </Box>

        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          p={2}
          bgcolor="#f0f0f0"
        >
          {messages.map((message, index) => (
            <Box 
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box 
                sx={{
                  maxWidth: '75%',
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: message.role === 'assistant' ? 'primary.light' : 'secondary.light',
                  color: message.role === 'assistant' ? 'primary.contrastText' : 'secondary.contrastText',
                  boxShadow: 1,
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          p={2}
          borderTop="1px solid #e0e0e0"
        >
          <TextField
            label="Type a message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            size="small"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            endIcon={<SendIcon />}
            sx={{ minWidth: '100px' }}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

