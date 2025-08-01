import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
    content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
    return (
        <ReactMarkdown
            components={{
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-semibold"
                    />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
