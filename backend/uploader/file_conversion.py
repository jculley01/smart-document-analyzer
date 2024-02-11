import fitz  # PyMuPDF
import os
import textract
import tempfile
import csv
import time  # For introducing delay

def convert_to_text(file_stream, extension):
    text = ""
    tmp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.' + extension) as tmp_file:
            file_stream.seek(0)
            tmp_file.write(file_stream.read())
            tmp_file_path = tmp_file.name
        
        if extension == 'pdf':
            # Use PyMuPDF for PDF files
            with fitz.open(tmp_file_path) as doc:
                text = "".join(page.get_text() for page in doc)
        elif extension in ['docx', 'png', 'jpg', 'jpeg', 'gif']:
            # Use textract for other supported file types
            text = textract.process(tmp_file_path).decode('utf-8')
            time.sleep(0.5)  # Introduce a brief delay
        elif extension in ['txt', 'csv']:
            with open(tmp_file_path, 'r', encoding='utf-8') as file:
                if extension == 'csv':
                    reader = csv.reader(file)
                    text = '\n'.join([', '.join(row) for row in reader])
                else:
                    text = file.read()
        else:
            raise ValueError("Unsupported file type")
    except Exception as e:
        print(f"Error processing file: {e}")
    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
    return text
