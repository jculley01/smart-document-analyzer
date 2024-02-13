from flask import Flask, jsonify, request, Blueprint
from models import db, Sentence, Paragraph  # Make sure models is correctly imported



sentiment_blueprint = Blueprint('sentiment', __name__)

@sentiment_blueprint.route('/content/<sentiment>', methods=['GET'])
def get_content_by_sentiment(sentiment):
    # Query the database for sentences with the matching sentiment
    sentences = Sentence.query.filter_by(sentiment=sentiment).all()
    paragraphs = Paragraph.query.filter_by(sentiment=sentiment).all()

    # Convert the sentence models to a dictionary/list format to jsonify
    sentences_data = [{'id': sentence.id, 'text': sentence.text, 'sentiment': sentence.sentiment, 'type': 'sentence'} for sentence in sentences]

    # Convert the paragraph models to a dictionary/list format to jsonify
    paragraphs_data = [{'id': paragraph.id, 'text': paragraph.text, 'sentiment': paragraph.sentiment, 'type': 'paragraph'} for paragraph in paragraphs]

    # Combine sentences and paragraphs into one list
    content_data = sentences_data + paragraphs_data

    return jsonify({'content': content_data})
