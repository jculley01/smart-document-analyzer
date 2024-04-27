import unittest
import nltk
from nlp.sentiment import detect_sentiment_vader  

class TestSentimentAnalysis(unittest.TestCase):
    def test_positive_sentiment(self):
        text = "I love this beautiful day!"
        self.assertEqual(detect_sentiment_vader(text), 'Positive', "Should detect positive sentiment")

    def test_negative_sentiment(self):
        text = "I hate this dreadful weather."
        self.assertEqual(detect_sentiment_vader(text), 'Negative', "Should detect negative sentiment")

    def test_neutral_sentiment(self):
        text = "This is an ordinary day."
        self.assertEqual(detect_sentiment_vader(text), 'Neutral', "Should detect neutral sentiment")

if __name__ == '__main__':
    unittest.main()
