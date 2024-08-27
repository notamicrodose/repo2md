from flask import Blueprint, request, send_file, render_template, jsonify, current_app
from app.utils import combine_files, generate_file_tree
from werkzeug.utils import secure_filename
import os
from app.config import Config
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
            # Normalize file paths and find the common path
            file_paths = [os.path.normpath(file.filename) for file in files]
            common_path = os.path.commonpath(file_paths) if file_paths else ''
            repo_name = os.path.basename(common_path) if common_path else 'default_repo_name'

            current_app.logger.debug(f"Common path: {common_path}, Repo name: {repo_name}")

            # Save files preserving their original structure
            for file in files:
                rel_path = os.path.relpath(file.filename, common_path)
                file_path = os.path.join(temp_dir, rel_path)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                file.save(file_path)

            current_app.logger.info(f"Processing files in temporary directory: {temp_dir}")
            
            # Generate file tree
            file_tree = generate_file_tree(temp_dir, repo_name)
            current_app.logger.info(f"Generated file tree:\n{file_tree}")

            # Use the synchronous combine_files function with repo_name
            combined_content = combine_files(temp_dir, repo_name)

            if not combined_content:
                return jsonify({'error': 'No valid files were found to combine'}), 400

            output_filename = f"{repo_name}.md"
            output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], output_filename)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(combined_content)

            current_app.logger.info(f"Files combined successfully. Output: {output_filename}")
            return jsonify({
                'message': 'Files combined successfully',
                'filename': output_filename,
                'file_tree': file_tree,
                'preview_content': combined_content,
                'repo_name': repo_name
            }), 200
    except Exception as e:
        error_msg = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
        current_app.logger.error(error_msg)
        return jsonify({'error': 'An error occurred while processing the files. Please check the server logs for more information.'}), 500


@main.route('/download/<filename>')
def download_file(filename):
    output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(output_path):
        return jsonify({'error': 'No combined file available for download'}), 404
    return send_file(output_path, as_attachment=True)
