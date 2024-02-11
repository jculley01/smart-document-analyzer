from flask import Blueprint, request, jsonify
from models import db, Document

summary_blueprint = Blueprint('summary', __name__)

@summary_blueprint.route('/documents/<int:document_id>', methods=['PUT'])
def update_document(document_id):
    # Attempt to retrieve the document from the database
    document = Document.query.get(document_id)
    if document is None:
        return jsonify({'error': 'Document not found'}), 404

    # Parse the incoming JSON data
    data = request.get_json()
    
    # Update the document's summary if provided
    if 'summary' in data:
        document.summary = data['summary']
    else:
        return jsonify({'error': 'No summary provided'}), 400

    # Save the changes to the database
    db.session.commit()

    # Return a success response
    return jsonify({'message': 'Document updated successfully', 'document_id': document_id}), 200
