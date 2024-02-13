import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

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
const Documents = ({uploadTrigger}) => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState({ id: null, filename: '' });
    const [keywords, setKeywords] = useState([]);
    const [currentKeywordDetails, setCurrentKeywordDetails] = useState({ keyword: '', definition: '', sentences: [] });
    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const [currentSummaryContent, setCurrentSummaryContent] = useState("");
    const [currentSummaryDocumentTitle, setCurrentSummaryDocumentTitle] = useState("");
    const [currentKeywordParagraphs, setCurrentKeywordParagraphs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);



    useEffect(() => {
        fetch('http://localhost:5000/api/documents')
            .then(response => response.json())
            .then(data => setDocuments(data))
            .catch(error => console.error('Error fetching documents:', error));
    }, [uploadTrigger]); // Add uploadTrigger as a dependency here

    const getSummary = (documentId) => {
        setIsLoading(true); // Start loading before any operation

        const doc = documents.find(doc => doc.id === documentId);
        if (doc && doc.summary) {
            // If the document already has a summary, we don't need to fetch it again
            setCurrentSummaryDocumentTitle(doc.filename);
            setCurrentSummaryContent(doc.summary);
            setIsSummaryVisible(true);
            setIsLoading(false); // Stop loading since the summary is already available
        } else {
            // If there's no summary, fetch it from the API
            fetch(`http://localhost:5000/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: doc.text_content, type: 'summary' }),
            })
                .then(response => response.json())
                .then(data => {
                    // Use the summary data.result here and return a promise for the next then()
                    return fetch(`http://localhost:5000/api/documents/${documentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ summary: data.result }),
                    })
                        .then(() => data); // Return data to be used in the next then block
                })
                .then(data => {
                    // Now data is defined here, where we can use its result
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
                    setIsLoading(false); // Stop loading regardless of the outcome
                });
        }
    };



    const getKeywords = (documentId) => {
        const doc = documents.find(doc => doc.id === documentId);

        // Reset current keyword details and paragraphs when selecting a new document
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


    const getKeywordDetails = (keywordText) => {
        if (!selectedDocument.id) {
            console.error('No document is selected.');
            return;
        }

        setIsLoading(true); // Start loading

        // Fetch keyword definition and sentences
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

                // Fetch paragraphs
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
                setCurrentKeywordParagraphs(paragraphData); // Assuming the API returns an array of paragraphs
                setIsLoading(false); // End loading
            })
            .catch(error => {
                console.error(`Error fetching details for keyword ${keywordText}:`, error);
                setIsLoading(false); // End loading in case of error as well
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
                                    variant="h6" // Use a larger variant for the title
                                    component="h2"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 'bold', // Make the font weight bold
                                        color: '#1976d2', // Change the color to a shade of blue (or any color you prefer)
                                        marginBottom: 2, // Increase the bottom margin for better spacing
                                        textAlign: 'center', // Center-align the title
                                        textTransform: 'uppercase', // Optional: CAPITALIZE the title
                                        letterSpacing: 1, // Increase letter spacing for better readability
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
