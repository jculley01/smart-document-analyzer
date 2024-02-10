import re
import spacy
from nltk.tokenize import sent_tokenize

# Load the pre-trained spaCy model
nlp = spacy.load("en_core_web_sm")

def extract_paragraphs(text):
    """
    Extract paragraphs from a given text using regular expressions to handle
    various whitespace characters.
    """
    return re.split(r'\n\s*\n', text.strip())

def extract_sentences(paragraph):
    """
    Extract sentences from a given paragraph using NLTK's sentence tokenizer,
    which is better at handling edge cases.
    """
    return sent_tokenize(paragraph)

def extract_keywords(text):
    """
    Extract all entities from text using spaCy for Named Entity Recognition (NER)
    and return them as a list of strings.
    """
    # Process the text with spaCy
    doc = nlp(text)
    
    # Initialize a list to hold all entities
    all_entities = []
    
    # Iterate over the entities in the document and add their text to the list
    for ent in doc.ents:
        all_entities.append(ent.text)
    
    return all_entities
