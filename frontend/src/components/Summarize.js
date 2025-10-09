import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './Summarize.css'; 

import { ReactComponent as LogoIcon } from '../assets/logo.svg'; 
import { ReactComponent as UserIcon } from '../assets/user-icon.svg';
import { ReactComponent as SendIcon } from '../assets/send.svg';

const API_BASE_URL = 'http://127.0.0.1:8000';

function Summarize() {
    const [urlInput, setUrlInput] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [knowledgeBases, setKnowledgeBases] = useState([]);
    const [chatHistories, setChatHistories] = useState({});
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatContainerRef = useRef(null);

    const currentMessages = useMemo(() => chatHistories[currentUrl] || [], [chatHistories, currentUrl]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [currentMessages, isLoading]);

    useEffect(() => {
        fetchKnowledgeBases();
    }, []);

    const updateMessagesForUrl = (url, newMessages) => {
        setChatHistories(prev => ({ ...prev, [url]: newMessages }));
    };

    const fetchKnowledgeBases = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/knowledge-bases`);
            setKnowledgeBases(response.data.knowledge_bases);
        } catch (err) { console.error('Failed to fetch knowledge bases:', err); }
    };

    // const handleCreateKnowledgeBase = async () => {
    //     if (!urlInput.trim()) { return; }
    //     const newUrl = urlInput;
    //     setIsLoading(true);
    //     setError('');
    //     setCurrentUrl(newUrl);
    //     updateMessagesForUrl(newUrl, [{ role: 'assistant', content: `Creating a knowledge base from **${newUrl}**...` }]);
    //     try {
    //         await axios.post(`${API_BASE_URL}/create-knowledge-base`, { url: newUrl });
    //         updateMessagesForUrl(newUrl, [{ role: 'assistant', content: `What would you like to know?` }]);
    //         setUrlInput(''); 
    //         await fetchKnowledgeBases();
    //     } catch (err) {
    //         const detail = err.response?.data?.detail || 'An unexpected error occurred.';
    //         setError(detail);
    //         updateMessagesForUrl(newUrl, [{ role: 'assistant', content: `❌ **Error:** ${detail}` }]);
    //     }
    //     setIsLoading(false);
    // };

    const handleCreateKnowledgeBase = async () => {
    if (!urlInput.trim()) return;

    const newUrl = urlInput;
    setIsLoading(true);
    setError('');
    setCurrentUrl(newUrl);

    updateMessagesForUrl(newUrl, [
        { role: 'assistant', content: ` Creating a knowledge base from **${newUrl}**... `}
    ]);

    try {
        const res = await axios.post(`${API_BASE_URL}/create-knowledge-base`, { url: newUrl });
        const summary = res.data.summary || 'No summary returned.';

        updateMessagesForUrl(newUrl, [
            { role: 'assistant', content:  `  Knowledge base created` },
            { role: 'assistant', content: ` **Summarized content:**\n\n${summary} `},
            { role: 'assistant', content: 'Is there anything to help You with?' }
        ]);

        setUrlInput('');
        await fetchKnowledgeBases();
    } catch (err) {
        const detail = err.response?.data?.detail || 'An unexpected error occurred.';
        setError(detail);
        updateMessagesForUrl(newUrl, [
            { role: 'assistant', content: `❌ **Error:** ${detail}` }
        ]);
    }

    setIsLoading(false);
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || !currentUrl || isLoading) return;
        const newUserMessage = { role: 'user', content: prompt };
        const updatedMessages = [...currentMessages, newUserMessage];
        updateMessagesForUrl(currentUrl, updatedMessages);
        const currentPrompt = prompt;
        setPrompt('');
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/chat`, { url: currentUrl, prompt: currentPrompt });
            updateMessagesForUrl(currentUrl, [...updatedMessages, response.data]);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error processing your request.';
            updateMessagesForUrl(currentUrl, [...updatedMessages, { role: 'assistant', content: `❌ **Error:** ${errorMessage}` }]);
        }
        setIsLoading(false);
    };

    const handleClearHistory = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/clear-history`);
            setKnowledgeBases([]);
            setChatHistories({});
            setCurrentUrl('');
            setUrlInput('');
        } catch (err) { setError('Failed to clear history.'); }
        setIsLoading(false);
    };

    const handleSelectKnowledgeBase = (kb) => {
        setCurrentUrl(kb);
    };

    return (
        <div className="container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <LogoIcon className="logo-icon" />
                    <h1>
                        <span>Summer</span>Tube AI
                    </h1>
                </div>

                <div className="sidebar-content">
                    <div className="url-input-section">
                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateKnowledgeBase()}
                            placeholder="Create knowledge base..."
                            disabled={isLoading}
                        />
                        <button onClick={handleCreateKnowledgeBase} disabled={isLoading || !urlInput.trim()}>
                            Load
                        </button>
                    </div>

                    <hr />
                    <button onClick={handleClearHistory} className="clear-btn">Clear All History</button>
                    
                    <ul className="knowledge-base-list">
                        {knowledgeBases.map((kb, index) => (
                            <li 
                                key={index} 
                                className={currentUrl === kb ? 'active' : ''}
                                onClick={() => handleSelectKnowledgeBase(kb)}
                            >
                                {kb.replace(/^(https?:\/\/)?(www\.)?/, '').substring(0, 35)}...
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <main className="main-content">
                <div className="chat-window" ref={chatContainerRef}>
                    {currentUrl ? (
                        currentMessages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.role}`}>
                                <div className={`message-icon ${msg.role === 'assistant' ? 'assistant-icon' : ''}`}>
                                    {msg.role === 'user' ? <UserIcon /> : <LogoIcon />}
                                </div>
                                <div className="message-content">
                                    {/* For user, just display the content as a prompt */}
                                    {msg.role === 'user' ? (
                                        <p className="user-prompt">{msg.content}</p>
                                    ) : (
                                        <ReactMarkdown children={msg.content} />
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="welcome-message">
                            <LogoIcon className="welcome-logo" />
                            <h2>Welcome to SummerTube AI</h2>
                            <p>Create a new knowledge base from a URL using the input in the sidebar.</p>
                        </div>
                    )}
                    {isLoading && currentUrl && 
                        <div className="message-wrapper assistant">
                            <div className="message-icon assistant-icon">
                                <LogoIcon />
                            </div>
                            <div className="message-content loading-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    }
                </div>

                <div className="input-area">
                     {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleChatSubmit} className="chat-input-form">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask me anything..."
                            disabled={!currentUrl || isLoading}
                        />
                        <button type="submit" className="send-button" disabled={!currentUrl || isLoading || !prompt.trim()}>
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Summarize;
