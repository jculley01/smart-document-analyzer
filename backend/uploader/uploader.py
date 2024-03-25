from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import db, Document, Paragraph, Sentence, Keyword, User
from .file_conversion import convert_to_text
from nlp.sentiment import detect_sentiment_vader
from .text_extractions import extract_paragraphs, extract_sentences, extract_keywords
from io import BytesIO
import os

uploader_blueprint = Blueprint('uploader', __name__)

def process_file(file_content, filename, user_id):
    print("Processing file:", filename)
    # Create a BytesIO object from the file content
    file_stream = BytesIO(file_content)
    
    # Assuming convert_to_text can now work with this file-like object
    text = convert_to_text(file_stream, filename.rsplit('.', 1)[1].lower())
    print("Text extracted for file:", filename)
    file_stream.close()  # It's a good practice to close the stream when you're done with it
    new_doc = Document(filename=filename, text_content=text, user_id=user_id)
    db.session.add(new_doc)
    db.session.flush()
    print("New document created:", filename)

    paragraphs = extract_paragraphs(text)
    for para_text in paragraphs:
        para_sentiment = detect_sentiment_vader(para_text)
        paragraph = Paragraph(document_id=new_doc.id, text=para_text, sentiment=para_sentiment, user_id=user_id)
        db.session.add(paragraph)
        db.session.flush()
        print("Paragraph processed:", para_text[:30])  # Show first 30 chars

        sentences = extract_sentences(para_text)
        for sent_text in sentences:
            sent_sentiment = detect_sentiment_vader(sent_text)
            sentence = Sentence(paragraph_id=paragraph.id, text=sent_text, sentiment=sent_sentiment, user_id=user_id)
            db.session.add(sentence)
            db.session.flush()
            print("Sentence processed:", sent_text[:30])  # Show first 30 chars

            keywords = extract_keywords(sent_text)
            for keyword_text in keywords:
                keyword = Keyword(sentence_id=sentence.id, text=keyword_text, user_id=user_id)
                db.session.add(keyword)
                print("Keyword added:", keyword_text)

    db.session.commit()
    print("File processed successfully:", filename)

@uploader_blueprint.route('/upload', methods=['POST'])
def upload_files():
    print("Upload request received")
    files = request.files.getlist('file')
    auth_sub = request.form.get('userId')

    if not files:
        print("No files provided")
        return jsonify({'error': 'No files provided'}), 400
    if not auth_sub:
        print("User ID is required")
        return jsonify({'error': 'User ID is required'}), 400

    for file in files:
        if file.filename == '':
            print("Empty filename, skipping")
            continue  # Skip empty filenames
        # Read the file content into memory
        file_content = file.read()
        filename = secure_filename(file.filename)
        print("Processing file:", filename)

        # Directly get or create the user
        user = User.query.filter_by(sub=auth_sub).first()
        if not user:
            print("Creating new user with sub:", auth_sub)
            user = User(sub=auth_sub)
            db.session.add(user)
            db.session.commit()

        # Process the file content directly here
        process_file(file_content, filename, user.id)

    return jsonify({'message': 'Files have been processed'}), 202

