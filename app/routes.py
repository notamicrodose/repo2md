from flask import Blueprint, request, send_file, render_template, jsonify, current_app
from werkzeug.utils import secure_filename
from app.utils import async_combine_files
from app.config import Config
import os
import tempfile
import traceback

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/upload', methods=['POST'])
def upload_files():
    if 'files[]' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    files = request.files.getlist('files[]')

    if not files or files[0].filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Find the common prefix (repository root)
            file_paths = [file.filename for file in files]
            common_prefix = os.path.commonprefix(file_paths)
            repo_name = common_prefix.split(os.sep)[0]

            # Save files preserving their original structure
            for file in files:
                rel_path = os.path.relpath(file.filename, common_prefix)
                file_path = os.path.join(temp_dir, rel_path)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                file.save(file_path)

            current_app.logger.info(f"Processing files in temporary directory: {temp_dir}")
            combined_content = async_combine_files(temp_dir)

        if not combined_content:
            return jsonify({'error': 'No valid files were found to combine'}), 400

        output_filename = f"{repo_name}.md"
        output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], output_filename)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(combined_content)

        current_app.logger.info(f"Files combined successfully. Output: {output_filename}")
        return jsonify({'message': 'Files combined successfully', 'filename': output_filename}), 200
    except Exception as e:
        error_msg = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
        current_app.logger.error(error_msg)
        return jsonify({'error': 'An error occurred while processing the files. Please check the server logs for more information.'}), 500

# @main.route('/upload', methods=['POST'])
# def upload_files():
#     if 'files[]' not in request.files:
#         return jsonify({'error': 'No files part'}), 400

#     files = request.files.getlist('files[]')

#     if not files or files[0].filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     try:
#         with tempfile.TemporaryDirectory() as temp_dir:
#             folder_name = "combined_output"  # Default folder name
#             for file in files:
#                 filename = secure_filename(file.filename)
#                 file_path = os.path.join(temp_dir, filename)
#                 os.makedirs(os.path.dirname(file_path), exist_ok=True)
#                 file.save(file_path)

#                 # Try to extract folder name from the first file
#                 path_parts = os.path.dirname(filename).split(os.path.sep)
#                 if path_parts and path_parts[0]:
#                     folder_name = path_parts[0]
#                     break  # We only need the first non-empty folder name

#             current_app.logger.info(f"Processing files in temporary directory: {temp_dir}")
#             combined_content = async_combine_files(temp_dir)

#         if not combined_content:
#             return jsonify({'error': 'No valid files were found to combine'}), 400

#         output_filename = f"{folder_name}.md"
#         output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], output_filename)
#         os.makedirs(os.path.dirname(output_path), exist_ok=True)

#         with open(output_path, 'w', encoding='utf-8') as f:
#             f.write(combined_content)

#         current_app.logger.info(f"Files combined successfully. Output: {output_filename}")
#         return jsonify({'message': 'Files combined successfully', 'filename': output_filename}), 200
#     except Exception as e:
#         error_msg = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
#         current_app.logger.error(error_msg)
#         return jsonify({'error': 'An error occurred while processing the files. Please check the server logs for more information.'}), 500

@main.route('/download/<filename>')
def download_file(filename):
    output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(output_path):
        return jsonify({'error': 'No combined file available for download'}), 404
    return send_file(output_path, as_attachment=True)
