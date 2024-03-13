import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useUser } from '../UserContext.js';
import {
    Box,
    Button,
    Container,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Card,
    CardContent,
} from '@mui/material';

const Documents = ({ uploadTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState({ id: null, filename: '' });
    const [keywords, setKeywords] = useState([]);
    const [currentKeywordDetails, setCurrentKeywordDetails] = useState({ keyword: '', definition: '', sentences: [] });
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const [currentSummaryContent, setCurrentSummaryContent] = useState("");
    const [currentSummaryDocumentTitle, setCurrentSummaryDocumentTitle] = useState("");
    const [currentKeywordParagraphs, setCurrentKeywordParagraphs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (user && user.sub) {
            fetch(`http://localhost:5000/api/documents?sub=${encodeURIComponent(user.sub)}`)
                .then(response => response.json())
                .then(data => setDocuments(data))
                .catch(error => console.error('Error fetching documents:', error));
        }
    }, [uploadTrigger, user]);

    // Function to handle fetching summary for a document
    const getSummary = (documentId) => {
        setIsLoading(true);

        const doc = documents.find(doc => doc.id === documentId);
        if (doc && doc.summary) {
            setCurrentSummaryDocumentTitle(doc.filename);
            setCurrentSummaryContent(doc.summary);
            setIsSummaryVisible(true);
            setIsLoading(false);
        } else {
            fetch(`http://localhost:5000/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: doc.text_content, type: 'summary' }),
            })
                .then(response => response.json())
                .then(data => {
                    return fetch(`http://localhost:5000/api/documents/${documentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ summary: data.result }),
                    })
                        .then(() => data);
                })
                .then(data => {
                    const updatedDocuments = documents.map(document => {
                        return document.id === documentId ? { ...document, summary: data.result } : document;
                    });
                    setDocuments(updatedDocuments);
                    setCurrentSummaryDocumentTitle(doc.filename);
                    setCurrentSummaryContent(data.result);
                    setIsSummaryVisible(true);
                })
                .catch(error => {
                    console.error('Error updating document with summary:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    // Function to handle fetching keywords for a document
    const getKeywords = (documentId) => {
        const doc = documents.find(doc => doc.id === documentId);

        setCurrentKeywordDetails({ keyword: '', definition: '', sentences: [] });
        setCurrentKeywordParagraphs([]);

        if (selectedDocument.id === documentId) {
            setSelectedDocument({ id: null, filename: '' });
            setKeywords([]);
        } else {
            fetch(`http://localhost:5000/api/documents/${documentId}/keywords`)
                .then(response => response.json())
                .then(data => {
                    setSelectedDocument({ id: documentId, filename: doc.filename });
                    setKeywords(data);
                })
                .catch(error => console.error('Error fetching keywords:', error));
        }
    };

    // Function to handle fetching details for a keyword
    const getKeywordDetails = (keywordText) => {
        if (!selectedDocument.id) {
            console.error('No document is selected.');
            return;
        }

        setIsLoading(true);

        fetch(`http://localhost:5000/api/keywords/definition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: keywordText }),
        })
            .then(response => response.json())
            .then(data => {
                setCurrentKeywordDetails(prevDetails => ({
                    ...prevDetails,
                    keyword: data.text,
                    definition: data.definition,
                }));

                return fetch(`http://localhost:5000/api/documents/${selectedDocument.id}/keywords/${encodeURIComponent(keywordText)}/sentences`);
            })
            .then(response => response.json())
            .then(sentenceData => {
                setCurrentKeywordDetails(prevDetails => ({
                    ...prevDetails,
                    sentences: sentenceData.sentences,
                }));

                return fetch(`http://localhost:5000/api/paragraphs/${encodeURIComponent(keywordText)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch paragraphs');
                }
                return response.json();
            })
            .then(paragraphData => {
                setCurrentKeywordParagraphs(paragraphData);
                setIsLoading(false);
            })
            .catch(error => {
                console.error(`Error fetching details for keyword ${keywordText}:`, error);
                setIsLoading(false);
            });
    };

    const handleClose = () => {
        setIsSummaryVisible(false);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom style={{ color: '#333', marginTop: '20px', textAlign: 'center' }}>
                Uploaded Documents
            </Typography>

            {documents.length > 0 ? (
                <TableContainer component={Paper} elevation={3} style={{ marginTop: '20px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Filename</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell component="th" scope="row">
                                        {doc.filename}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button variant="contained" color="primary" onClick={() => getSummary(doc.id)} style={{ marginRight: '10px' }}>
                                            Get Summary
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => getKeywords(doc.id)}>
                                            Get Keywords
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1" gutterBottom style={{ marginTop: '20px', textAlign: 'center' }}>
                    No documents available.
                </Typography>
            )}

            {selectedDocument.id && keywords.length > 0 && (
                <Card variant="outlined" style={{ marginTop: '30px' }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Keywords for: {selectedDocument.filename}
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Keyword</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {keywords.map((kw, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{kw.text}</TableCell>
                                            <TableCell align="right">
                                                <Button variant="outlined" onClick={() => getKeywordDetails(kw.text)}>
                                                    Get Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                    <CircularProgress />
                </Box>
            ) : currentKeywordDetails.keyword && (
                <Card variant="outlined" style={{ marginTop: '30px' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Details for: {currentKeywordDetails.keyword}
                        </Typography>
                        <Typography paragraph>
                            <strong>Definition:</strong> {currentKeywordDetails.definition}
                        </Typography>
                        <Typography paragraph>
                            <strong>Sentences:</strong>
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableBody>
                                    {currentKeywordDetails.sentences.map((sentence, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{sentence.text}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Typography paragraph sx={{ mt: 2 }}>
                            <strong>Paragraphs:</strong>
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Paragraph</TableCell>
                                        <TableCell>Document Title</TableCell>
                                        <TableCell>Document ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentKeywordParagraphs.map((paragraph, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{paragraph.paragraph_text}</TableCell>
                                            <TableCell>{paragraph.document_title}</TableCell>
                                            <TableCell>{paragraph.document_id}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            <Modal
                open={isSummaryVisible}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 650, bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '80vh', overflowY: 'auto' }}>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography
                                id="modal-title"
                                variant="h6"
                                component="h2"
                                gutterBottom
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#1976d2',
                                    marginBottom: 2,
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                }}
                            >
                                Summary for {currentSummaryDocumentTitle}
                            </Typography>

                            <Typography id="modal-description" variant="body2">
                                {currentSummaryContent}
                            </Typography>
                            <Box textAlign="right" mt={2}>
                                <Button onClick={handleClose}>Close</Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

        </Container>
    );
};

export default Documents;
