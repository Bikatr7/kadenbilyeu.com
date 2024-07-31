// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Input, Textarea } from "@chakra-ui/react";

// markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface PostEditorProps 
{
    title: string;
    content: string;
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ title, content, setTitle, setContent }) => 
{
    return (
        <Box display="flex" flexDirection={["column", "column", "row"]}>
            <Box flex="1" mr={4}>
                <Input
                    placeholder="Title"
                    mb={4}
                    borderColor="gray.500"
                    focusBorderColor="gray.500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                    placeholder="Content (Markdown supported)"
                    mb={4}
                    borderColor="gray.500"
                    focusBorderColor="gray.500"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    height="500px"
                />
            </Box>
            <Box
                flex="1"
                ml={[0, 0, 4]}
                mt={[4, 4, 0]}
                bg="rgba(0, 0, 0, 0.7)"
                p={4}
                borderRadius="md"
                border="1px solid gray.500"
                overflowY="auto"
                height="570px"
            >
                <Box
                    className="markdown-preview"
                    sx={{
                        'h1, h2, h3, h4, h5, h6': {
                            marginTop: '1em',
                            marginBottom: '0.5em',
                            fontWeight: 'bold',
                            color: 'white',
                        },
                        'h1': { fontSize: '2em' },
                        'h2': { fontSize: '1.5em' },
                        'p': { marginBottom: '1em', color: 'gray.300' },
                        'ul, ol': {
                            marginLeft: '2em',
                            marginBottom: '1em',
                            color: 'gray.300',
                        },
                        'li': { marginBottom: '0.5em' },
                        'code': {
                            backgroundColor: 'gray.700',
                            padding: '0.2em 0.4em',
                            borderRadius: '3px',
                            color: 'yellow.200',
                        },
                        'pre': {
                            backgroundColor: 'gray.700',
                            padding: '1em',
                            overflowX: 'auto',
                            marginBottom: '1em',
                        },
                        'blockquote': {
                            borderLeft: '4px solid',
                            borderColor: 'gray.500',
                            paddingLeft: '1em',
                            marginLeft: '0',
                            fontStyle: 'italic',
                            color: 'gray.400',
                        },
                        'a': {
                            color: 'blue.300',
                            textDecoration: 'underline',
                        },
                        'img': {
                            maxWidth: '100%',
                            height: 'auto',
                        },
                    }}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                    >
                        {content}
                    </ReactMarkdown>
                </Box>
            </Box>
        </Box>
    );
};

export default PostEditor;