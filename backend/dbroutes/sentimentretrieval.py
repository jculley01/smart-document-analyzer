from flask import Flask, jsonify, request, Blueprint
from models import db, Sentence, Paragraph, User, Document  # Ensure all necessary models are imported

sentiment_blueprint = Blueprint('sentiment', __name__)

@sentiment_blueprint.route('/content/<sentiment>', methods=['GET'])
def get_content_by_sentiment(sentiment):
    # Expect the 'sub' value as a request argument to find the attached user's content
    user_sub = request.args.get('sub')
    
    if not user_sub:
        return jsonify({'error': 'Missing user identifier'}), 400
    
    # Find the actual user by their "sub" identity
    user = User.query.filter_by(sub=user_sub).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Find all documents associated with this user
    user_documents_ids = [doc.id for doc in user.documents]

    # Account for the data structure: sentences are within paragraphs, which are within documents.
    # Adjust the way you filter sentences and paragraphs to only select those within the user's documents.
    # First, get all paragraphs from the user's documents
    paragraphs = Paragraph.query.join(Document).filter(Document.id.in_(user_documents_ids), Paragraph.sentiment == sentiment).all()

    # Now, filter sentences through paragraphs. This will get a list of ids of paragraphs that match the criteria.
    paragraphs_ids = [paragraph.id for paragraph in paragraphs]
    
    # Finally, get the sentences that belong to the valid paragraphs
    sentences = Sentence.query.filter(Sentence.paragraph_id.in_(paragraphs_ids), Sentence.sentiment == sentiment).all()

    # Convert the data to the required data list format
    sentences_data = [{'id': sentence.id, 'text': sentence.text, 'sentiment': sentence.sentiment, 'type': 'sentence'} for sentence in sentences]
    paragraphs_data = [{'id': paragraph.id, 'text': paragraph.text, 'sentiment': paragraph.sentiment, 'type': 'paragraph'} for paragraph in paragraphs]

    content_data = sentences_data + paragraphs_data

    return jsonify({'content': content_data})
