from openai import OpenAI
import os


def get_keyword_info(client, keyword):
    """
    Fetches information or a definition about a given keyword using the OpenAI GPT model.
    The keyword could be a location, institution, or name.

    Parameters:
    - keyword (str): The keyword to get information about.

    Returns:
    - str: A brief description or definition of the keyword.
    """
    MODEL = "gpt-3.5-turbo"
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a knowledgeable assistant who provides brief descriptions or definitions for keywords. Provide a definition or description for the following keyword."},
            {"role": "user", "content": keyword},
        ],
        temperature=0,
    )

    info = response.choices[0].message.content
    return info
