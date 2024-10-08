'use client'
import { Box, Stack, TextField, Button, Typography, Paper } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { useState, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am the Wikipedia Assistant. How can I help you today?',
    },
  ]);

  const [message, setMessage] = useState('');
  const [wikiTitle, setWikiTitle] = useState('');
  const [funFacts, setFunFacts] = useState([]);

  // Function to extract the Wikipedia link from the assistant's latest message
  const extractWikiLink = (text) => {
    const regex = /\((https:\/\/en.wikipedia.org\/wiki\/[^\)]+)\)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  // Function to send a fun facts prompt to the assistant and update fun facts state
  const fetchFunFacts = async (title) => {
    const funFactsPrompt = `Give me 5 fun facts about ${title}. Please do not bold or italicize the text or use any special format, and for this message only, do not include the Wikipedia link at the end of the message.`;

    // Send the fun facts prompt to the server
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: funFactsPrompt }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    await reader.read().then(function processText({ done, value }) {
      if (done) return result;
      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      result += text;
      return reader.read().then(processText);
    });

    // Update the fun facts based on the assistant's response
    setFunFacts(result.split('\n').filter(fact => fact.trim()));
  };

  // Effect to run when messages are updated
  useEffect(() => {
    if (messages.length > 0) {
      const latestAssistantMessage = messages[messages.length - 1];
      const wikiLink = extractWikiLink(latestAssistantMessage.content);

      if (wikiLink) {
        const title = wikiLink.split('/').pop().replace(/_/g, ' ');
        setWikiTitle(title);
        fetchFunFacts(title); // Fetch fun facts without recording the prompt and response in the chat history
      }
    }
  }, [messages]); // Depend on messages state

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Update messages state with user message and empty assistant message
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    // Send the user message to the server
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

    setMessage('');
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="row"
      bgcolor="#f5f5f5"
    >
      <Box
        sx={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          backgroundColor: '#003366', // Dark blue background
          color: '#ffffff', // White text color
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: '#003366', // Dark blue background
            color: '#ffffff', // White text color
          }}
        >
          <Box
            sx={{
              p: 2,
              backgroundColor: '#00509e', // Medium blue background for header
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6">
              Wikipedia Assistant
            </Typography>
          </Box>

          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            p={2}
            bgcolor="#003366" // Dark blue background for chat area
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
                    backgroundColor: message.role === 'assistant' ? '#004080' : '#00509e', // Different shades of blue
                    color: 'white',
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
            borderTop="1px solid #004080" // Darker blue for border
          >
            <TextField
              label="Type a message..."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ backgroundColor: 'white', color: 'black' }} // White background for text field
            />

            <Button
              variant="contained"
              color="primary"
              onClick={sendMessage}
              endIcon={<SendIcon />}
              sx={{ minWidth: '100px', backgroundColor: '#00509e', color: 'white' }} // Medium blue button
            >
              Send
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Box
        sx={{
          width: '50%',
          height: '100%',
          p: 2,
          overflowY: 'auto',
          bgcolor: '#ffffff', // White background for right panel
          color: '#003366', // Dark blue text color
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            height: '100%',
            overflowY: 'auto',
            bgcolor: '#ffffff', // White background for paper
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#003366' }}>
            Fun Facts
          </Typography>
          <Typography variant="h5" sx={{ mb: 2, color: '#003366' }}>
            {wikiTitle}
          </Typography>
          {funFacts.length > 0 ? (
            funFacts.map((fact, index) => (
              <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                {fact}
              </Typography>
            ))
          ) : (
            <Typography variant="body1">
              No fun facts available.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
