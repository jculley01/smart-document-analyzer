# app/routes/keyword_routes.py

from flask import Blueprint, jsonify
from models import Keyword, Sentence, Paragraph, Document

keyword_blueprint = Blueprint('keyword', __name__)

@keyword_blueprint.route('/documents/<int:document_id>/keywords', methods=['GET'])
def get_keywords_for_document(document_id):
    # Query keywords related to the specified document ID
    keywords = Keyword.query.join(Sentence, Keyword.sentence_id == Sentence.id)\
                             .join(Paragraph, Sentence.paragraph_id == Paragraph.id)\
                             .join(Document, Paragraph.document_id == Document.id)\
                             .filter(Document.id == document_id)\
                             .all()

    keyword_list = [{'id': kw.id, 'text': kw.text, 'definition': kw.definition, 'sentence_id': kw.sentence_id} for kw in keywords]
    
    return jsonify(keyword_list)
