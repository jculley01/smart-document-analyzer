import React, { useState, useEffect } from 'react';
import { Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useUser } from '../UserContext.js';
const Sentiment = () => {
    const [content, setContent] = useState([]);
    const [selectedSentiment, setSelectedSentiment] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showTable, setShowTable] = useState(false); // State to control table visibility
    const { user } = useUser();

    const fetchContent = (sentiment, page) => {
        // Assuming user.sub is accessible in this context; if not, you may need to pass it as an argument to fetchContent
        const userSub = user.sub; // Get the user.sub from your user context or state

        fetch(`http://localhost:5000/api/content/${sentiment}?page=${page}&sub=${userSub}`) // Include userSub in the query
            .then(response => response.json())
            .then(data => {
                setContent(data.content || []);
                setShowTable(true); // Show the table after fetching content
            })
            .catch(error => console.error('Error fetching content:', error));
    };


    useEffect(() => {
        if (selectedSentiment) {
            fetchContent(selectedSentiment, currentPage);
        }
    }, [selectedSentiment, currentPage]);

    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const resetContent = () => {
        setContent([]);
        setCurrentPage(1);
        setShowTable(false); // Hide the table
    };

    const handleClearSelection = () => {
        setSelectedSentiment('');
        resetContent();
    };

    return (
        <div>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                {/* Buttons inside a Material-UI Box, centered horizontally */}
                <Box border={1} borderColor="grey.500" p={2} m={2} display="flex" justifyContent="center" gap={2}>
                    <Button onClick={() => { setSelectedSentiment('Positive'); resetContent(); }} color="success">Positive</Button>
                    <Button onClick={() => { setSelectedSentiment('Neutral'); resetContent(); }} color="warning">Neutral</Button>
                    <Button onClick={() => { setSelectedSentiment('Negative'); resetContent(); }} color="error">Negative</Button>
                    {selectedSentiment && <Button onClick={handleClearSelection}>Clear</Button>}
                </Box>
            </Box>
            {showTable && // Render table only when showTable is true
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Text</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {content.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.text}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
            {(content.length === currentPage * 5) && ( // Assuming 5 items per page
                <Button onClick={handleLoadMore} color="primary">Load More</Button>
            )}
        </div>
    );
};

export default Sentiment;
