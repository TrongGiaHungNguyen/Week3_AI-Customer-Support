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
  const [wikiSummary, setWikiSummary] = useState('');

  // Function to extract the Wikipedia link from the assistant's latest message
  const extractWikiLink = (text) => {
    const regex = /\((https:\/\/en.wikipedia.org\/wiki\/[^\)]+)\)/;
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  const fetchWikipediaSummary = async (url) => {
    try {
      const title = url.split('/').pop();
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      const data = await response.json();
      setWikiTitle(data.title);
      setWikiSummary(data.extract);
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
      setWikiTitle('Error');
      setWikiSummary('Unable to fetch Wikipedia summary.');
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
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

    // Extract the Wikipedia link from the latest assistant message
    const latestAssistantMessage = messages[messages.length - 1];
    const wikiLink = extractWikiLink(latestAssistantMessage.content);

    console.log(wikiLink);

    if (wikiLink) {
      // Fetch the Wikipedia summary based on the extracted link
      await fetchWikipediaSummary(wikiLink);
    }

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
              Wikipedia Assistant
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

      <Box
        sx={{
          width: '50%',
          height: '100%',
          p: 2,
          overflowY: 'auto',
          bgcolor: '#f5f5f5',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Wikipedia Information
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {wikiTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {wikiSummary}
          </Typography>
          {wikiTitle && (
            <Typography variant="body2">
              For more details, visit <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`} target="_blank" rel="noopener noreferrer">{wikiTitle} - Wikipedia</a>
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}