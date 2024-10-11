'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { queryAI, AIResponse, ChatMessage } from '@/utils/aiUtils';
import { executePythonCode } from '@/utils/pyodideUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface DisplayMessage {
  id: string;
  text: string;
  isUser: boolean;
  code?: string;
  executionResult?: string;
}

interface ChatInterfaceProps {
  onQuerySubmit: (query: string, aiResponse: AIResponse, executionResult: string) => Promise<void>;
  dataFrameInfo: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onQuerySubmit, dataFrameInfo }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Initialize chat history with system message
    setChatHistory([
      {
        role: 'system',
        content: `You are a data analysis assistant. Interpret the user's query, generate Python code for analysis, and provide explanations. Here's the current dataset information:

${dataFrameInfo}

Use the 'df' DataFrame for your analysis.`
      }
    ]);
  }, [dataFrameInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      const query = inputValue.trim();
      setInputValue('');

      const newUserMessage: DisplayMessage = { id: Date.now().toString(), text: query, isUser: true };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);

      // Add user message to chat history
      const updatedChatHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: query }];
      setChatHistory(updatedChatHistory);

      try {
        const aiResponse = await queryAI(updatedChatHistory);

        let executionResult = '';
        if (aiResponse.code) {
          const { output } = await executePythonCode(aiResponse.code);
          executionResult = output;
        }

        const newAIMessage: DisplayMessage = { 
          id: (Date.now() + 1).toString(), 
          text: aiResponse.text,
          isUser: false,
          code: aiResponse.code,
          executionResult: executionResult
        };
        setMessages(prevMessages => [...prevMessages, newAIMessage]);

        // Add AI response to chat history
        setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse.text }]);

        await onQuerySubmit(query, aiResponse, executionResult);
      } catch (error) {
        console.error('Error processing query:', error);
        const errorMessage: DisplayMessage = { 
          id: (Date.now() + 1).toString(), 
          text: 'Sorry, there was an error processing your request.', 
          isUser: false 
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderMessage = (message: DisplayMessage) => {
    return (
      <Card className={`mb-4 ${message.isUser ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}>
        <CardContent className="p-4">
          <div className="flex items-start">
            <Avatar className={`w-8 h-8 mr-3 ${message.isUser ? 'bg-primary-500' : 'bg-secondary-500'} flex justify-center items-center`}>
              {message.isUser ? 'U' : 'AI'}
            </Avatar>
            <div className="flex-grow">
              <div className="mb-2">{message.text}</div>
              {message.code && (
                <div className="mb-2">
                  <div className="text-sm font-semibold mb-1">Generated Code:</div>
                  <SyntaxHighlighter language="python" style={vs2015} className="rounded-md text-sm">
                    {message.code}
                  </SyntaxHighlighter>
                </div>
              )}
              {message.executionResult && (
                <div>
                  <div className="text-sm font-semibold mb-1">Execution Result:</div>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm overflow-x-auto">
                    {message.executionResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-18rem)] bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
      <ScrollArea className="flex-grow mb-4 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {renderMessage(message)}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form ref={formRef} onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 rounded-b-lg">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow"
          placeholder="Ask a question about your data..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="px-4 py-2">
          {isLoading ? <FiLoader className="animate-spin" /> : <FiSend />}
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;