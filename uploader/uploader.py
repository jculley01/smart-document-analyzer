from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import db
from models import Document
from .file_conversion import convert_to_text

uploader_blueprint = Blueprint('uploader', __name__)

@uploader_blueprint.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    text = convert_to_text(file.stream, filename.rsplit('.', 1)[1].lower())
    
    new_doc = Document(filename=filename, text_content=text)
    db.session.add(new_doc)
    db.session.commit()
    
    return jsonify({'message': 'File successfully processed', 'doc_id': new_doc.id}), 200
