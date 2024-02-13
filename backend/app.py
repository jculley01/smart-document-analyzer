from flask import Flask
from dbroutes.sentimentretrieval import sentiment_blueprint
from dbroutes.paragraphs import paragraph_blueprint
from dbroutes.sentences import sentences_blueprint
from dbroutes.definitions import definition_blueprint
from dbroutes.documentupdate import summary_blueprint
from dbroutes.documents import document_blueprint
from uploader.uploader import uploader_blueprint
from dbroutes.keywords import keyword_blueprint
from nlp.analysis import analysis_blueprint  # Import the analysis blueprint
from models import db
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
app.config.from_pyfile('config.py')

# Set up CORS with default options - this will allow all origins by default
CORS(app)
CORS(summary_blueprint)

db.init_app(app)
migrate = Migrate(app, db)

# Register both blueprints
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
    app.run(debug=True)
