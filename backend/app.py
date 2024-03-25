from flask import Flask
from dbroutes.sentimentretrieval import sentiment_blueprint
from dbroutes.paragraphs import paragraph_blueprint
from dbroutes.sentences import sentences_blueprint
from dbroutes.definitions import definition_blueprint
from dbroutes.documentupdate import summary_blueprint
from dbroutes.documents import document_blueprint
from uploader.uploader import uploader_blueprint, worker
from dbroutes.keywords import keyword_blueprint
from nlp.analysis import analysis_blueprint
from models import db
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from threading import Thread
import os

app = Flask(__name__)

# Environment-based configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS', 'False') == 'True'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16 MB limit

print(app.config['SQLALCHEMY_DATABASE_URI'])


CORS(app)  # Set up CORS with default options to allow all origins by default
CORS(summary_blueprint)

db.init_app(app)
migrate = Migrate(app, db)

# Register blueprints
app.register_blueprint(uploader_blueprint, url_prefix='/api')
app.register_blueprint(analysis_blueprint, url_prefix='/api')
app.register_blueprint(keyword_blueprint, url_prefix='/api')
app.register_blueprint(document_blueprint, url_prefix='/api')
app.register_blueprint(summary_blueprint, url_prefix='/api')
app.register_blueprint(definition_blueprint, url_prefix='/api')
app.register_blueprint(sentences_blueprint, url_prefix='/api')
app.register_blueprint(paragraph_blueprint, url_prefix='/api')
app.register_blueprint(sentiment_blueprint, url_prefix='/api')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        try:
            db.engine.execute('SELECT 1')
            print("Database connection OK")
        except Exception as e:
            print("Database connection failed:", e)
    for _ in range(4):
        t = Thread(target=worker, args=(app,), daemon=True)
        t.start()
    app.run(debug=True)
