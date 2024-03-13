import openai
import os

def summarize_text(client, text):
    """
    Summarizes the given text using the OpenAI GPT model.

    Parameters:
    - text (str): The text to summarize.

    Returns:
    - str: The summary of the text, or an error message if an API call fails.
    """
    MODEL = "gpt-3.5-turbo"
    try:
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
    except openai.OpenAIError as e:
        # Handle specific OpenAI API errors here
        # Log the error for debugging purposes if necessary
        return "Reached ChatGPT quota, please try again later"
