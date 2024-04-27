import unittest
import sys
import os
sys.path.insert(0, os.path.abspath('../..'))  # Adjust this path based on the actual relative path to the project root
from uploader.text_extractions import extract_keywords, extract_paragraphs, extract_sentences
import nltk
nltk.download('punkt')


class TestTextProcessing(unittest.TestCase):
    def test_extract_paragraphs(self):
        text = "Hello world.\n\nThis is a test paragraph.\n\nAnother paragraph here."
        result = extract_paragraphs(text)
        expected = ["Hello world.", "This is a test paragraph.", "Another paragraph here."]
        self.assertEqual(result, expected, "Should correctly split text into paragraphs")

    def test_extract_sentences(self):
        paragraph = "This is a sentence. Here is another one! And the last one?"
        result = extract_sentences(paragraph)
        expected = ["This is a sentence.", "Here is another one!", "And the last one?"]
        self.assertEqual(result, expected, "Should correctly split a paragraph into sentences")

    def test_extract_keywords(self):
        text = "Apple is looking at buying U.K. startup for $1 billion"
        result = extract_keywords(text)
        expected = ["Apple", "U.K.", "$1 billion"]
        self.assertEqual(result, expected, "Should correctly extract entities as keywords")

if __name__ == '__main__':
    unittest.main()
