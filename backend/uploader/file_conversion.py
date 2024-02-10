import textract
import os
import tempfile
import csv

def convert_to_text(file_stream, extension):
    text = ""
    tmp_file_path = None  # Initialize the variable outside of the try block
    try:
        # Create a temporary file to save the uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.' + extension) as tmp_file:
            file_stream.seek(0)  # Move to the beginning of file_stream
            tmp_file.write(file_stream.read())  # Save the file stream to a temporary file
            tmp_file_path = tmp_file.name  # Store the temporary file path
        
        if extension in ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'gif']:
            # Use textract for supported file types
            text = textract.process(tmp_file_path).decode('utf-8')
        elif extension in ['txt', 'csv']:
            # For CSV and plain text files, read them directly
            with open(tmp_file_path, 'r', encoding='utf-8') as file:
                if extension == 'csv':
                    reader = csv.reader(file)
                    # Combine all rows into a single text block
                    text = '\n'.join([', '.join(row) for row in reader])
                else:
                    text = file.read()
        else:
            raise ValueError("Unsupported file type")
    except Exception as e:
        print(f"Error processing file: {e}")
    finally:
        # Clean up the temporary file if it was created
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
    return text
