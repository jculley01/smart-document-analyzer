from flask import Blueprint, jsonify
from models import db, Paragraph, Sentence, Keyword, Document

paragraph_blueprint = Blueprint('paragraph', __name__)

@paragraph_blueprint.route('/paragraphs/<keyword_text>', methods=['GET'])
def get_paragraphs_containing_keyword(keyword_text):
    # Query to find paragraphs across all documents containing the specified keyword
    paragraphs = db.session.query(Paragraph, Document) \
        .join(Sentence) \
        .join(Sentence.keywords) \
        .join(Paragraph.document) \
        .filter(Keyword.text.ilike(f'%{keyword_text}%')) \
        .distinct() \
        .all()

    paragraphs_data = [{
        'paragraph_id': paragraph.id,
        'paragraph_text': paragraph.text,
        'document_id': document.id,
        'document_title': document.filename  # Assuming you use filename as title
        # Include other document fields as necessary
    } for paragraph, document in paragraphs]

    return jsonify(paragraphs_data)


