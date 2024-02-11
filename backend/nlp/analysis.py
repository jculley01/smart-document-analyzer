from flask import Blueprint, request, jsonify
import os
from .definition import get_keyword_info
from .summary import summarize_text
from .sentiment import analyze_sentiment_with_openai
from openai import OpenAI

analysis_blueprint = Blueprint('analysis', __name__)

@analysis_blueprint.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.get_json()
    if not data or 'text' not in data or 'type' not in data:
        return jsonify({'error': 'Request must contain text and type fields'}), 400

    text = data['text']
    analysis_type = data['type'].lower()
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "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"))
    if analysis_type == 'definition':
        # Assuming get_keyword_info returns a definition for the keyword
        result = get_keyword_info(client, text)
    elif analysis_type == 'summary':
        result = summarize_text(client, text)
    elif analysis_type == 'sentiment':
        result = analyze_sentiment_with_openai(client, text)
    else:
        return jsonify({'error': 'Invalid analysis type. Choose from definition, summary, or sentiment'}), 400

    return jsonify({'result': result}), 200

# Remember to register the Blueprint in your main Flask application setup
# app.register_blueprint(analysis_blueprint, url_prefix='/api')
