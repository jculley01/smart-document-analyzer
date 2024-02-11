from flask import Blueprint, request, jsonify
from models import db, Keyword
from nlp.definition import get_keyword_info
from openai import OpenAI
import os

definition_blueprint = Blueprint('definition', __name__)

@definition_blueprint.route('/keywords/definition', methods=['POST'])
def get_or_update_definition():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Request must contain a text field'}), 400

    keyword_text = data['text']
    keyword = Keyword.query.filter_by(text=keyword_text).first()
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "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"))
    # If the keyword exists and has a definition, return it
    if keyword and keyword.definition:
        return jsonify({'text': keyword.text, 'definition': keyword.definition}), 200

    # If the keyword doesn't have a definition or doesn't exist, generate and save it
    if not keyword:
        keyword = Keyword(text=keyword_text)
        db.session.add(keyword)

    # Assuming `get_keyword_info` fetches or generates the definition
    definition = get_keyword_info(client, keyword_text)
    keyword.definition = definition
    db.session.commit()

    return jsonify({'text': keyword.text, 'definition': definition}), 200
