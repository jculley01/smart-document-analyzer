from flask import Flask
from uploader.uploader import uploader_blueprint
from nlp.analysis import analysis_blueprint  # Import the analysis blueprint
from models import db
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config.from_pyfile('config.py')

db.init_app(app)
migrate = Migrate(app, db)

# Register both blueprints
app.register_blueprint(uploader_blueprint, url_prefix='/api')
app.register_blueprint(analysis_blueprint, url_prefix='/api')  # Use the same or different prefix as needed

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
