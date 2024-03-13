from flask import Blueprint, jsonify, request
from models import Document, User

document_blueprint = Blueprint('document', __name__)

@document_blueprint.route('/documents', methods=['GET'])
def get_documents():
    # Retrieve user_sub from the query parameters
    user_sub = request.args.get('sub')

    if not user_sub:
        return jsonify({'error': 'User sub is required'}), 400

    # Find the user by sub
    user = User.query.filter_by(sub=user_sub).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Filter documents by the found user's ID
    documents = Document.query.filter_by(user_id=user.id).all()

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

