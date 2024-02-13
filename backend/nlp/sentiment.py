import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

nltk.download('vader_lexicon')

def detect_sentiment_vader(text):
    """
    Detects the sentiment of the provided text using NLTK's VADER.

    Parameters:
    - text (str): The text whose sentiment needs to be analyzed.

    Returns:
    - str: 'Positive', 'Negative', or 'Neutral' based on the sentiment analysis.
    """
    sia = SentimentIntensityAnalyzer()
    score = sia.polarity_scores(text)

    # Classifying the sentiment based on the compound score
    if score['compound'] >= 0.05:
        return 'Positive'
    elif score['compound'] <= -0.05:
        return 'Negative'
    else:
        return 'Neutral'
