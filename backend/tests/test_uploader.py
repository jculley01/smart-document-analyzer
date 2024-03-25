import io
import unittest
from unittest.mock import patch
from flask import Flask
from app import app, db 

class UploaderBlueprintTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Use an in-memory database for tests
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
        self.user_id = "user_123"

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    @patch('uploader.uploader.worker')  # Update the path according to your project structure
    @patch('uploader.file_conversion.convert_to_text', return_value="Extracted text")  # Update the path
    def test_successful_upload(self, mock_convert_to_text, mock_worker):
        data = {
            'userId': self.user_id,
            'file': (io.BytesIO(b'This is a test file'), 'test.txt'),
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 202)
        self.assertIn('Files are being processed', response.json['message'])

    def test_upload_no_files_provided(self):
        data = {'userId': self.user_id}
        response = self.client.post('/api/upload', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('No files provided', response.json['error'])

    def test_upload_no_user_id(self):
        data = {
            'file': (io.BytesIO(b'This is a test file'), 'test.txt'),
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        self.assertIn('User ID is required', response.json['error'])

    @patch('uploader.uploader.worker')  # Again, update the path
    def test_empty_filename_skipped(self, mock_worker):
        data = {
            'userId': self.user_id,
            'file': (io.BytesIO(b''), ''),  # Empty filename
        }
        response = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 202)

if __name__ == '__main__':
    unittest.main()
