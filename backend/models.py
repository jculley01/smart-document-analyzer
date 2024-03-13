from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Keeping 'id' as an Integer.
    sub = db.Column(db.String(255), unique=True, nullable=False)  # 'sub' is the OAuth provided ID.
    documents = db.relationship('Document', back_populates='user', cascade="all, delete-orphan")

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Foreign Key should now reference `user.id` as an integer.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    filename = db.Column(db.String(255), nullable=False)
    text_content = db.Column(db.Text)
    summary = db.Column(db.Text)
    sentiment = db.Column(db.String(50))
    paragraphs = db.relationship('Paragraph', back_populates='document', cascade="all, delete-orphan")
    user = db.relationship('User', back_populates='documents')

class Paragraph(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('document.id'), nullable=False)
    # Foreign Key should reference `user.id` as an integer.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    text = db.Column(db.Text)
    summary = db.Column(db.Text)
    sentiment = db.Column(db.String(250))
    document = db.relationship('Document', back_populates='paragraphs')
    sentences = db.relationship('Sentence', back_populates='paragraph', cascade="all, delete-orphan")

class Sentence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paragraph_id = db.Column(db.Integer, db.ForeignKey('paragraph.id'), nullable=False)
    # Foreign Key should reference `user.id` as an integer.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    text = db.Column(db.Text)
    sentiment = db.Column(db.String(250))
    paragraph = db.relationship('Paragraph', back_populates='sentences')
    keywords = db.relationship('Keyword', back_populates='sentence', cascade="all, delete-orphan")

class Keyword(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sentence_id = db.Column(db.Integer, db.ForeignKey('sentence.id'), nullable=False)
    # Foreign Key should reference `user.id` as an integer.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    text = db.Column(db.String(255))
    definition = db.Column(db.Text)
    sentence = db.relationship('Sentence', back_populates='keywords')
