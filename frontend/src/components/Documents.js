import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography,
    Container,
    Box,
    Modal
} from '@mui/material';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState({ id: null, filename: '' });
    const [keywords, setKeywords] = useState([]);
    const [currentKeywordDetails, setCurrentKeywordDetails] = useState({ keyword: '', definition: '', sentences: [] });
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const [currentSummaryContent, setCurrentSummaryContent] = useState("");
    const [currentSummaryDocumentTitle, setCurrentSummaryDocumentTitle] = useState("");

    useEffect(() => {
        fetch('http://localhost:5000/api/documents')
            .then(response => response.json())
            .then(data => setDocuments(data))
            .catch(error => console.error('Error fetching documents:', error));
    }, []);

    const getSummary = (documentId) => {
        const doc = documents.find(doc => doc.id === documentId);
        if (doc && doc.summary) {
            setCurrentSummaryDocumentTitle(doc.filename);
            setCurrentSummaryContent(doc.summary);
            setIsSummaryVisible(true);
        } else {
            fetch(`http://localhost:5000/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: doc.text_content, type: 'summary' }),
            })
                .then(response => response.json())
                .then(data => {
                    fetch(`http://localhost:5000/api/documents/${documentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ summary: data.result }),
                    })
                        .then(() => {
                            const updatedDocuments = documents.map(document => {
                                return document.id === documentId ? { ...document, summary: data.result } : document;
                            });
                            setDocuments(updatedDocuments);
                            setCurrentSummaryDocumentTitle(doc.filename);
                            setCurrentSummaryContent(data.result);
                            setIsSummaryVisible(true);
                        })
                        .catch(error => console.error('Error updating document with summary:', error));
                })
                .catch(error => console.error('Error generating summary:', error));
        }
    };

    const getKeywords = (documentId) => {
        const doc = documents.find(doc => doc.id === documentId);
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

    const getKeywordDetails = (keywordText) => {
        if (!selectedDocument.id) {
            console.error('No document is selected.');
            return;
        }

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
            })
            .catch(error => console.error(`Error fetching details for keyword ${keywordText}:`, error));
    };

    const handleClose = () => {
        setIsSummaryVisible(false);
    };

    return (
        <Container className="container">
            <Typography variant="h4" gutterBottom style={{ color: '#333', lineHeight: '1.6' }}>
                Uploaded Documents
            </Typography>

            <Paper elevation={3} className="table">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Filename</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {documents.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell>{doc.filename}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" onClick={() => getSummary(doc.id)}>
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
            </Paper>

            {selectedDocument.id && keywords.length > 0 && (
                <Box mt={4}>
                    <Typography variant="h5">
                        Showing Keywords for: {selectedDocument.filename}
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Keyword</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {keywords.map((kw, index) => (
                                <TableRow key={index}>
                                    <TableCell>{kw.text}</TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={() => getKeywordDetails(kw.text)}>
                                            Get Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {currentKeywordDetails.keyword && (
                <Box mt={4}>
                    <Typography variant="h6">
                        Details for: {currentKeywordDetails.keyword}
                    </Typography>
                    <Typography>
                        <strong>Definition:</strong> {currentKeywordDetails.definition}
                    </Typography>
                    <Typography mt={2}>
                        <strong>Sentences containing "{currentKeywordDetails.keyword}":</strong>
                    </Typography>
                    <ul>
                        {currentKeywordDetails.sentences.map((sentence, idx) => (
                            <li key={sentence.sentence_id}>{sentence.text}</li>
                        ))}
                    </ul>
                </Box>
            )}

            <Modal
                open={isSummaryVisible}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}>
                    <Typography variant="h6" id="modal-modal-title">
                        {currentSummaryDocumentTitle}
                    </Typography>
                    <Typography variant="body2" id="modal-modal-description">
                        {currentSummaryContent}
                    </Typography>
                    <Button onClick={handleClose}>Close</Button>
                </Box>
            </Modal>
        </Container>
    );
};

export default Documents;
