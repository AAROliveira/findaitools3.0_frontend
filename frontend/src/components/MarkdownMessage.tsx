import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
    content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
};
