from flask import Blueprint, jsonify
from models import db, Sentence, Paragraph

sentences_blueprint = Blueprint('sentences', __name__)

@sentences_blueprint.route('/documents/<int:document_id>/keywords/<keyword>/sentences', methods=['GET'])
def get_sentences_from_keyword_in_document(document_id, keyword):
    # Join Sentence with Paragraph and filter by document_id and keyword in sentence text
    sentences = db.session.query(Sentence).\
                join(Paragraph).\
                filter(Paragraph.document_id == document_id).\
                filter(Sentence.text.contains(keyword)).\
                all()

    # Format the sentences for JSON response
    sentences_list = [{'sentence_id': sentence.id, 'text': sentence.text} for sentence in sentences]

    # Return the sentences in the response
    return jsonify({'keyword': keyword, 'sentences': sentences_list}), 200
