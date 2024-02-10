from openai import OpenAI
import os

def summarize_text(client, text):
    """
    Summarizes the given text using the OpenAI GPT model.

    Parameters:
    - text (str): The text to summarize.

    Returns:
    - str: The summary of the text.
    """
    MODEL = "gpt-3.5-turbo"
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a skilled assistant who will give me a detailed summary of this text."},
            {"role": "user", "content": text},
        ],
        temperature=0,
    )

    summary = response.choices[0].message.content
    return summary
