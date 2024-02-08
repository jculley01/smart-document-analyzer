from flask import Flask
from uploader.uploader import uploader_blueprint
from models import db

app = Flask(__name__)
app.config.from_pyfile('config.py')

db.init_app(app)

app.register_blueprint(uploader_blueprint, url_prefix='/api')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
