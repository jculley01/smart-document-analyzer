# app/routes/document_routes.py

from flask import Blueprint, jsonify
from models import Document

document_blueprint = Blueprint('document', __name__)

@document_blueprint.route('/documents', methods=['GET'])
def get_documents():
    documents = Document.query.all()
    document_list = [
        {
            'id': doc.id,
            'filename': doc.filename,
            'text_content': doc.text_content,
            'summary': doc.summary,
            'sentiment': doc.sentiment
        } 
        for doc in documents
    ]
    
    return jsonify(document_list)
