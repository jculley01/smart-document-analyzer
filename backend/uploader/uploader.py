from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import db, Document, Paragraph, Sentence, Keyword
from .file_conversion import convert_to_text
from .text_extractions import extract_paragraphs, extract_sentences, extract_keywords
import os

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

    # Create a new document without immediate analysis
    new_doc = Document(filename=filename, text_content=text)
    db.session.add(new_doc)
    db.session.flush()  # Flush to assign an ID to new_doc without committing the transaction

    paragraphs = extract_paragraphs(text)
    for para_text in paragraphs:
        paragraph = Paragraph(document_id=new_doc.id, text=para_text)
        db.session.add(paragraph)
        db.session.flush()  # Assign ID to paragraph

        sentences = extract_sentences(para_text)
        for sent_text in sentences:
            sentence = Sentence(paragraph_id=paragraph.id, text=sent_text)
            db.session.add(sentence)
            # Flush here if you need to reference the sentence ID below
            db.session.flush()

            # Keywords are extracted but not analyzed for definition
            keywords = extract_keywords(sent_text)
            for keyword_text in keywords:
                keyword = Keyword(sentence_id=sentence.id, text=keyword_text)
                db.session.add(keyword)

    db.session.commit()

    return jsonify({'message': 'File successfully uploaded', 'doc_id': new_doc.id}), 200
