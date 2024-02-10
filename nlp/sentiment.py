from openai import OpenAI
import os

def analyze_sentiment_with_openai(client, text):
    """
    Analyzes the sentiment of the given text using the OpenAI GPT model.

    Parameters:
    - text (str): The text to analyze.

    Returns:
    - str: A string indicating the sentiment of the text.
    """
    MODEL = "gpt-3.5-turbo"
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant skilled in analyzing sentiment. Determine whether the sentiment of the following text is positive, negative, or neutral."},
            {"role": "user", "content": text},
        ],
        temperature=0,
    )

    sentiment = response.choices[0].message.content
    # sentiment = "this is a test sentiment"
    return sentiment
