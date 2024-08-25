# Repository: tmpmqe4b5dy

# File Tree

```
tmpmqe4b5dy/
├── app/
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── script.js
│   ├── templates/
│   │   └── index.html
│   ├── __init__.py
│   ├── config.py
│   ├── routes.py
│   └── utils.py
├── uploads/
│   └── repo2md.md
├── readme.md
├── requirements.txt
└── run.py
```

# run.py

```python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)

```

# app/config.py

```python
import os
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    OUTPUT_FILE = 'combined_output.md'
    ALLOWED_EXTENSIONS = {'py', 'js','jsx','ts','tsx', 'html', 'css', 'java', 'cpp', 'h', 'c', 'ts', 'tsx', 'go', 'rs', 'rb', 'php', 'scala', 'kt', 'swift', 'r', 'sql'}
    EXCLUDED_EXTENSIONS = {
        # Images
        'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'svg', 'webp',
        # Videos
        'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv',
        # Audio
        'mp3', 'wav', 'aac', 'flac', 'ogg',
        # Documents
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
        # Archives
        'jar', 'zip', 'tar', 'gz', 'rar', '7z',
        # Executables
        'exe', 'dll', 'bin', 'sh', 'bat', 'cmd',
        # Settings and configs
        'ini', 'cfg', 'conf', 'json', 'yaml', 'yml', 'toml',
        # Other
        'log', 'lock', 'bak', 'tmp', 'swp', 'swo', 'DS_Store', '.DS_Store'
    }
    EXCLUDED_DIRECTORIES = {'node_modules', '__pycache__', '.git', '.svn', '.hg', '.idea', '.vscode', 'build', 'dist', 'target'}
    MAX_CONTENT_LENGTH = 1000 * 1024 * 1024  # 1000 MB

```

# app/__init__.py

```python
from flask import Flask
from app.config import Config
import os

def create_app(config_class=Config):
    app = Flask(__name__,
                template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
                static_folder=os.path.join(os.path.dirname(__file__), 'static'),
                static_url_path='/static')
    app.config.from_object(config_class)

    @app.after_request
    def add_csp_header(response):
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        return response

    from app import routes
    app.register_blueprint(routes.main)

    return app
```

# app/utils.py

```python
import os
import logging
from werkzeug.utils import secure_filename
from app.config import Config

logger = logging.getLogger(__name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def excluded_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.EXCLUDED_EXTENSIONS

def excluded_directory(path):
    return any(excluded in path.split(os.path.sep) for excluded in Config.EXCLUDED_DIRECTORIES)

def get_language_from_extension(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    language_map = {
        'py': 'python',
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'html': 'html',
        'css': 'css',
        'java': 'java',
        'cpp': 'cpp',
        'h': 'cpp',
        'c': 'c',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby',
        'php': 'php',
        'scala': 'scala',
        'kt': 'kotlin',
        'swift': 'swift',
        'r': 'r',
        'sql': 'sql'
    }
    return language_map.get(ext, '')

def process_file(file_path, relative_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except UnicodeDecodeError:
        logger.warning(f"UTF-8 decoding failed for {file_path}. Trying ISO-8859-1.")
        with open(file_path, 'r', encoding='iso-8859-1') as file:
            content = file.read()
    except Exception as e:
        logger.error(f"Error processing file {file_path}: {str(e)}")
        content = f"Error processing file: {str(e)}"

    language = get_language_from_extension(file_path)
    return f"# {relative_path}\n\n```{language}\n{content}\n```\n\n"

def combine_files(directory_path):
    repo_name = os.path.basename(directory_path)
    content = f"# Repository: {repo_name}\n\n"

    # Generate file tree
    file_tree = generate_file_tree(directory_path, root_name=repo_name)
    content += f"# File Tree\n\n```\n{file_tree}\n```\n\n"

    for root, dirs, files in os.walk(directory_path):
        # Remove excluded directories
        dirs[:] = [d for d in dirs if not excluded_directory(os.path.join(root, d))]

        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, directory_path)

            if not excluded_directory(relative_path) and allowed_file(file) and not excluded_file(file):
                content += process_file(file_path, relative_path)

    if not content:
        logger.warning("No files to process in the directory.")
        return f"# Repository: {repo_name}\n\nNo files were found to combine."

    return content

def generate_file_tree(directory, root_name=None):
    logger.info(f"Generating file tree for directory: {directory}")
    tree = []
    directory = os.path.abspath(directory)
    
    if root_name is None:
        root_name = os.path.basename(directory)
    
    def add_to_tree(path, prefix=""):
        nonlocal tree
        entries = sorted(os.scandir(path), key=lambda e: (not e.is_dir(), e.name.lower()))
        
        for i, entry in enumerate(entries):
            is_last = (i == len(entries) - 1)
            node = "└── " if is_last else "├── "
            
            if entry.is_dir() and not entry.name.startswith('.'):
                tree.append(f"{prefix}{node}{entry.name}/")
                add_to_tree(entry.path, prefix + ("    " if is_last else "│   "))
            elif entry.is_file():
                tree.append(f"{prefix}{node}{entry.name}")
    
    tree.append(f"{root_name}/")
    add_to_tree(directory)
    
    result = '\n'.join(tree)
    logger.info(f"Generated file tree:\n{result}")
    return result


# import os
# import asyncio
# from werkzeug.utils import secure_filename
# from app.config import Config
# import logging

# logger = logging.getLogger(__name__)

# def combine_files(directory_path):
#     tasks = []
#     repo_name = os.path.basename(directory_path)
#     content = f"# Repository: {repo_name}\n\n"

#     # Generate file tree
#     file_tree = generate_file_tree(directory_path, root_name=repo_name)
#     content += f"# File Tree\n\n```\n{file_tree}\n```\n\n"

#     for root, dirs, files in os.walk(directory_path):
#         # Remove excluded directories
#         dirs[:] = [d for d in dirs if not excluded_directory(os.path.join(root, d))]

#         for file in files:
#             file_path = os.path.join(root, file)
#             relative_path = os.path.relpath(file_path, directory_path)

#             if not excluded_directory(relative_path) and allowed_file(file) and not excluded_file(file):
#                 content += process_file(file_path, relative_path)

#     if not content:
#         logger.warning("No files to process in the directory.")
#         return f"# Repository: {repo_name}\n\nNo files were found to combine."

#     return content

# def process_file(file_path, relative_path):
#     try:
#         with open(file_path, 'r', encoding='utf-8') as file:
#             content = file.read()
#     except UnicodeDecodeError:
#         logger.warning(f"UTF-8 decoding failed for {file_path}. Trying ISO-8859-1.")
#         with open(file_path, 'r', encoding='iso-8859-1') as file:
#             content = file.read()
#     except Exception as e:
#         logger.error(f"Error processing file {file_path}: {str(e)}")
#         content = f"Error processing file: {str(e)}"

#     language = get_language_from_extension(file_path)
#     return f"# {relative_path}\n\n```{language}\n{content}\n```\n\n"

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# def excluded_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.EXCLUDED_EXTENSIONS

# def excluded_directory(path):
#     return any(excluded in path.split(os.path.sep) for excluded in Config.EXCLUDED_DIRECTORIES)

# def get_language_from_extension(filename):
#     ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
#     language_map = {
#         'py': 'python',
#         'js': 'javascript',
#         'jsx': 'javascript',
#         'ts': 'typescript',
#         'tsx': 'typescript',
#         'html': 'html',
#         'css': 'css',
#         'java': 'java',
#         'cpp': 'cpp',
#         'h': 'cpp',
#         'c': 'c',
#         'go': 'go',
#         'rs': 'rust',
#         'rb': 'ruby',
#         'php': 'php',
#         'scala': 'scala',
#         'kt': 'kotlin',
#         'swift': 'swift',
#         'r': 'r',
#         'sql': 'sql'
#     }
#     return language_map.get(ext, '')

# async def process_file(file_path, relative_path):
#     try:
#         with open(file_path, 'r', encoding='utf-8') as file:
#             content = file.read()
#     except UnicodeDecodeError:
#         logger.warning(f"UTF-8 decoding failed for {file_path}. Trying ISO-8859-1.")
#         with open(file_path, 'r', encoding='iso-8859-1') as file:
#             content = file.read()
#     except Exception as e:
#         logger.error(f"Error processing file {file_path}: {str(e)}")
#         content = f"Error processing file: {str(e)}"

#     language = get_language_from_extension(file_path)
#     return f"# {relative_path}\n\n```{language}\n{content}\n```\n\n"

# async def process_directory(directory_path, base_path):
#     tasks = []
#     repo_name = os.path.basename(directory_path)
#     content = f"# Repository: {repo_name}\n\n"

#     for root, dirs, files in os.walk(directory_path):
#         # Remove excluded directories
#         dirs[:] = [d for d in dirs if not excluded_directory(os.path.join(root, d))]

#         for file in files:
#             file_path = os.path.join(root, file)
#             relative_path = os.path.relpath(file_path, directory_path)

#             if not excluded_directory(relative_path) and allowed_file(file) and not excluded_file(file):
#                 tasks.append(process_file(file_path, relative_path))

#     if not tasks:
#         logger.warning("No files to process in the directory.")
#         return f"# Repository: {repo_name}\n\nNo files were found to combine."

#     results = await asyncio.gather(*tasks)
#     content += ''.join(results)
#     return content

# # async def async_combine_files(directory_path):
# #     tasks = []
# #     repo_name = os.path.basename(directory_path)
# #     content = f"# Repository: {repo_name}\n\n"

# #     # Generate file tree
# #     file_tree = generate_file_tree(directory_path, root_name=repo_name)
# #     content += f"# File Tree\n\n```\n{file_tree}\n```\n\n"

# #     for root, dirs, files in os.walk(directory_path):
# #         # Remove excluded directories
# #         dirs[:] = [d for d in dirs if not excluded_directory(os.path.join(root, d))]

# #         for file in files:
# #             file_path = os.path.join(root, file)
# #             relative_path = os.path.relpath(file_path, directory_path)

# #             if not excluded_directory(relative_path) and allowed_file(file) and not excluded_file(file):
# #                 tasks.append(process_file(file_path, relative_path))

# #     if not tasks:
# #         logger.warning("No files to process in the directory.")
# #         return f"# Repository: {repo_name}\n\nNo files were found to combine."

# #     results = await asyncio.gather(*tasks)
# #     content += ''.join(results)
# #     return content

# # def generate_file_tree(directory, root_name=None):
# #     logger.info(f"Generating file tree for directory: {directory}")
# #     tree = []
# #     directory = os.path.abspath(directory)
    
# #     if root_name is None:
# #         root_name = os.path.basename(directory)
    
# #     tree.append(f"{root_name}/")
    
# #     for root, dirs, files in os.walk(directory):
# #         level = root.replace(directory, '').count(os.sep)
# #         indent = '│   ' * level
# #         subindent = '│   ' * (level + 1)
        
# #         for i, dir_name in enumerate(dirs):
# #             if dir_name.startswith('.'):
# #                 dirs.pop(i)
# #                 continue
# #             if i == len(dirs) - 1 and len(files) == 0:
# #                 tree.append(f"{indent}└── {dir_name}/")
# #             else:
# #                 tree.append(f"{indent}├── {dir_name}/")
        
# #         for i, file in enumerate(files):
# #             if i == len(files) - 1:
# #                 tree.append(f"{subindent}└── {file}")
# #             else:
# #                 tree.append(f"{subindent}├── {file}")
    
# #     result = '\n'.join(tree)
# #     logger.info(f"Generated file tree:\n{result}")
# #     return result

# def generate_file_tree(directory, root_name=None):
#     logger.info(f"Generating file tree for directory: {directory}")
#     tree = []
#     directory = os.path.abspath(directory)
    
#     if root_name is None:
#         root_name = os.path.basename(directory)
    
#     def add_to_tree(path, prefix=""):
#         nonlocal tree
#         entries = sorted(os.scandir(path), key=lambda e: (not e.is_dir(), e.name.lower()))
        
#         for i, entry in enumerate(entries):
#             is_last = (i == len(entries) - 1)
#             node = "└── " if is_last else "├── "
            
#             if entry.is_dir() and not entry.name.startswith('.'):
#                 tree.append(f"{prefix}{node}{entry.name}/")
#                 add_to_tree(entry.path, prefix + ("    " if is_last else "│   "))
#             elif entry.is_file():
#                 tree.append(f"{prefix}{node}{entry.name}")
    
#     tree.append(f"{root_name}/")
#     add_to_tree(directory)
    
#     result = '\n'.join(tree)
#     logger.info(f"Generated file tree:\n{result}")
#     return result
```

# app/routes.py

```python
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
            
            # Generate file tree
            file_tree = generate_file_tree(temp_dir, root_name=repo_name)
            current_app.logger.info(f"Generated file tree:\n{file_tree}")

            # Use the synchronous combine_files function
            combined_content = combine_files(temp_dir)

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
                'preview_content': combined_content
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


# from flask import Blueprint, request, send_file, render_template, jsonify, current_app
# from app.utils import combine_files, generate_file_tree
# from werkzeug.utils import secure_filename
# import asyncio
# import os
# from app.config import Config
# import tempfile
# import traceback

# # from flask import Blueprint, request, send_file, render_template, jsonify, current_app
# # from app.utils import async_combine_files, generate_file_tree
# # from werkzeug.utils import secure_filename
# # from app.utils import async_combine_files
# # from app.config import Config
# # import os
# # import tempfile
# # import traceback

# main = Blueprint('main', __name__)

# @main.route('/')
# def index():
#     return render_template('index.html')

# # @main.route('/upload', methods=['POST'])
# # def upload_files():
# #     if 'files[]' not in request.files:
# #         return jsonify({'error': 'No files part'}), 400

# #     files = request.files.getlist('files[]')

# #     if not files or files[0].filename == '':
# #         return jsonify({'error': 'No selected file'}), 400

# #     try:
# #         with tempfile.TemporaryDirectory() as temp_dir:
# #             # Find the common prefix (repository root)
# #             file_paths = [file.filename for file in files]
# #             common_prefix = os.path.commonprefix(file_paths)
# #             repo_name = common_prefix.split(os.sep)[0]

# #             # Save files preserving their original structure
# #             for file in files:
# #                 rel_path = os.path.relpath(file.filename, common_prefix)
# #                 file_path = os.path.join(temp_dir, rel_path)
# #                 os.makedirs(os.path.dirname(file_path), exist_ok=True)
# #                 file.save(file_path)

# #             current_app.logger.info(f"Processing files in temporary directory: {temp_dir}")
# #             combined_content = async_combine_files(temp_dir, file_tree)
            
# #             # Generate file tree
# #             file_tree = generate_file_tree(temp_dir, root_name=repo_name)
# #             current_app.logger.info(f"Generated file tree:\n{file_tree}")

# #             # Pass file_tree to async_combine_files
# #             combined_content = async_combine_files(temp_dir, file_tree)

# #         if not combined_content:
# #             return jsonify({'error': 'No valid files were found to combine'}), 400
        

# #         # Prepare the preview content
# #         preview_content = combined_content

# #         output_filename = f"{repo_name}.md"
# #         output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], output_filename)
# #         os.makedirs(os.path.dirname(output_path), exist_ok=True)

# #         with open(output_path, 'w', encoding='utf-8') as f:
# #             f.write(combined_content)

# #         current_app.logger.info(f"Files combined successfully. Output: {output_filename}")
# #         return jsonify({
# #             'message': 'Files combined successfully',
# #             'filename': output_filename,
# #             'file_tree': file_tree,
# #             'preview_content': preview_content
# #         }), 200
# #     except Exception as e:
# #         error_msg = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
# #         current_app.logger.error(error_msg)
# #         return jsonify({'error': 'An error occurred while processing the files. Please check the server logs for more information.'}), 500

# @main.route('/upload', methods=['POST'])
# def upload_files():
#     if 'files[]' not in request.files:
#         return jsonify({'error': 'No files part'}), 400

#     files = request.files.getlist('files[]')

#     if not files or files[0].filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     try:
#         with tempfile.TemporaryDirectory() as temp_dir:
#             # Find the common prefix (repository root)
#             file_paths = [file.filename for file in files]
#             common_prefix = os.path.commonprefix(file_paths)
#             repo_name = common_prefix.split(os.sep)[0]

#             # Save files preserving their original structure
#             for file in files:
#                 rel_path = os.path.relpath(file.filename, common_prefix)
#                 file_path = os.path.join(temp_dir, rel_path)
#                 os.makedirs(os.path.dirname(file_path), exist_ok=True)
#                 file.save(file_path)

#             current_app.logger.info(f"Processing files in temporary directory: {temp_dir}")
            
#             # Generate file tree
#             file_tree = generate_file_tree(temp_dir, root_name=repo_name)
#             current_app.logger.info(f"Generated file tree:\n{file_tree}")

#             # Pass file_tree to async_combine_files
#             combined_content = combine_files(temp_dir)

#             if not combined_content:
#                 return jsonify({'error': 'No valid files were found to combine'}), 400

#             # Prepare the preview content
#             preview_content = combined_content

#             output_filename = f"{repo_name}.md"
#             output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], output_filename)
#             os.makedirs(os.path.dirname(output_path), exist_ok=True)

#             with open(output_path, 'w', encoding='utf-8') as f:
#                 f.write(combined_content)

#             current_app.logger.info(f"Files combined successfully. Output: {output_filename}")
#             return jsonify({
#                 'message': 'Files combined successfully',
#                 'filename': output_filename,
#                 'file_tree': file_tree,
#                 'preview_content': preview_content
#             }), 200
#     except Exception as e:
#         error_msg = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
#         current_app.logger.error(error_msg)
#         return jsonify({'error': 'An error occurred while processing the files. Please check the server logs for more information.'}), 500

# # from flask import current_app, jsonify, request, Blueprint
# # import asyncio
# # import os
# # import tempfile
# # import traceback
# # from app.utils import async_combine_files, generate_file_tree


# # @main.route('/upload', methods=['POST'])
# # async def upload_files():
# #     if 'files[]' not in request.files:
# #         return jsonify({'error': 'No files part'}), 400

# #     files = request.files.getlist('files[]')

# #     if not files or files[0].filename == '':
# #         return jsonify({'error': 'No selected file'}), 400

# #     try:
# #         with tempfile.TemporaryDirectory() as temp_dir:
# #             # Find the common prefix (repository root)
# #             file_paths = [file.filename for file in files]
# #             common_prefix = os.path.commonprefix(file_paths)
# #             repo_name = common_prefix.split(os.sep)[0]

# #             # Save files preserving their original structure
# #             for file in files:
# #                 rel_path = os.path.relpath(file.filename, common_prefix)
# #                 file_path = os.path.join(temp_dir, rel_path)
# #                 os.makedirs(os.path.dirname(file_path), exist_ok=True)
# #                 file.save(file_path)

# #             current_app.logger.info(f"Processing files in temporary directory: {temp_dir}")
            
# #             # Generate file tree
# #             file_tree = generate_file_tree(temp_dir, root_name=repo_name)
# #             current_app.logger.info(f"Generated file tree:\n{file_tree}")

# #             # Use asyncio.run to run the async function
# #             combined_content = await async_combine_files(temp_dir, file_tree)

# #             if not combined_content:
# #                 return jsonify({'error': 'No valid files were found to combine'}), 400

# #             # Prepare the preview content
# #             preview_content = combined_content

# #             output_filename = f"{repo_name}.md"
# #             output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], output_filename)
# #             os.makedirs(os.path.dirname(output_path), exist_ok=True)

# #             with open(output_path, 'w', encoding='utf-8') as f:
# #                 f.write(combined_content)

# #             current_app.logger.info(f"Files combined successfully. Output: {output_filename}")
# #             return jsonify({
# #                 'message': 'Files combined successfully',
# #                 'filename': output_filename,
# #                 'file_tree': file_tree,
# #                 'preview_content': preview_content
# #             }), 200
# #     except Exception as e:
# #         error_msg = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
# #         current_app.logger.error(error_msg)
# #         return jsonify({'error': 'An error occurred while processing the files. Please check the server logs for more information.'}), 500


# @main.route('/download/<filename>')
# def download_file(filename):
#     output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
#     if not os.path.exists(output_path):
#         return jsonify({'error': 'No combined file available for download'}), 404
#     return send_file(output_path, as_attachment=True)

```

# app/static/css/styles.css

```css
:root {
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --secondary-color: #10b981;
    --secondary-hover: #059669;
    --background-color: #f3f4f6;
    --card-background: #ffffff;
    --text-color: #111827;
    --text-muted: #6b7280;
    --border-color: #e5e7eb;
    --success-color: #34d399;
    --error-color: #f87171;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    color: var(--text-color);
    background-color: var(--background-color);
}

.container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
}

.header {
    background-color: var(--card-background);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    padding: 1rem 0;
}

.header-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
}

.main {
    padding: 2rem 0;
}

.two-column-layout {
    display: flex;
    gap: 2rem;
    /* height: calc(100vh - 100px);  */
}

.column {
    flex: 1;
    overflow: hidden;
}

.left-column {
    flex: 0 0 38%;
}

.right-column {
    flex: 0 0 62%;
    display: flex;
    flex-direction: column;
}

.card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 0.7rem;
    padding: 1.5rem;
}

.card-header {
    padding: 1rem 1.5rem;
    border-radius: 0.3rem 0.3rem 0 0;
    /* border-bottom: 1px solid var(--border-color); */
    background-color: #f9fafb;
}

.card-title {
    font-size: 1.25rem;
    font-weight: 600;
}

.card-body-preview {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0 0 0.3rem 0.3rem;
}

.upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 0.75rem;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    background-color: #f9fafb;
}

.upload-area:hover, .upload-area.highlight {
    border-color: var(--primary-color);
    background-color: #e0f2fe;
}

.upload-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.upload-text {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.upload-subtext {
    color: var(--text-muted);
    margin-bottom: 1rem;
}

.btn {
    display: inline-block;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: var(--primary-hover);
}

.btn-secondary {
    background-color: var(--secondary-color);
    color: white;
}

.btn-secondary:hover {
    background-color: var(--secondary-hover);
}

.file-gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.file-gallery div {
    background-color: #f3f4f6;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.file-gallery .remove-icon {
    cursor: pointer;
    color: var(--error-color);
    margin-left: 0.5rem;
    font-weight: bold;
}

.file-count {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--text-muted);
}

.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.status {
    margin-top: 1rem;
    font-style: italic;
    color: var(--text-muted);
}

.progress-container {
    margin-top: 1rem;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
}

.progress-bar {
    height: 0.5rem;
    background-color: var(--primary-color);
    width: 0%;
    transition: width 0.3s ease;
}

.preview {
    flex: 1;
    overflow-y: auto;
    background-color: #ffffff;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    padding: 1rem;
}

.file-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.file-tree {
    margin-bottom: 1.5rem;
}

.file-tree pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
}

.file-section {
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    overflow: hidden;
}

.file-header {
    font-family: 'Inter', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary-color);
    margin: 0;
    padding: 0.5rem 1rem;
    background-color: #f0f4f8;
}

.file-body {
    margin: 0;
    padding: 1rem;
    background-color: #f9fafb;
    overflow-x: auto;
}

.file-body code {
    font-family: 'Courier New', Courier, monospace;
}

@media (max-width: 1024px) {
    .two-column-layout {
        flex-direction: column;
        height: auto;
    }

    .left-column, .right-column {
        flex: 1 1 100%;
    }
}

/* Add styles for syntax highlighting */
.hljs {
    background: #f9fafb;
    padding: 1em;
    border-radius: 0.375rem;
}
```

# app/static/js/script.js

```javascript
document.addEventListener("DOMContentLoaded", function () {
  let dropArea = document.getElementById("drop-area");
  let uploadButton = document.getElementById("uploadBtn");
  let downloadButton = document.getElementById("downloadBtn");
  let statusDiv = document.getElementById("status");
  let progressBar = document.getElementById("progress-bar");
  let progressBarContainer = document.getElementById("progress-bar-container");
  let fileInput = document.getElementById("fileElem");

  const excludedExtensions = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "bmp",
    "tiff",
    "svg",
    "webp",
    "mp4",
    "avi",
    "mov",
    "mkv",
    "flv",
    "wmv",
    "mp3",
    "wav",
    "aac",
    "flac",
    "ogg",
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
    "jar",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "exe",
    "dll",
    "bin",
    "sh",
    "bat",
    "cmd",
    "ini",
    "cfg",
    "conf",
    "json",
    "yaml",
    "yml",
    "toml",
    "log",
    "lock",
    "bak",
    "tmp",
    "swp",
    "swo",
    "DS_Store",
    ".DS_Store",
  ];

  const excludedDirectories = [
    "node_modules",
    "__pycache__",
    ".git",
    ".svn",
    ".hg",
    ".idea",
    ".vscode",
    "build",
    "dist",
    "target",
  ];

  let uploadedFiles = [];
  let downloadFilename = "";

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    dropArea.classList.add("highlight");
  }

  function unhighlight() {
    dropArea.classList.remove("highlight");
  }

  function isAllowedFile(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    const path = file.webkitRelativePath || file.name;
    const directories = path.split("/");

    for (let dir of directories) {
      if (excludedDirectories.includes(dir)) {
        return false;
      }
    }

    return !excludedExtensions.includes(extension);
  }

  function handleFiles(e) {
    let files = e.target.files || e.dataTransfer.files;
    uploadedFiles = Array.from(files).filter(isAllowedFile);
    updateGallery();
  }

  uploadButton.addEventListener("click", function () {
    if (uploadedFiles.length === 0) {
        updateStatus("No files selected");
        return;
    }
  
    let formData = new FormData();
    uploadedFiles.forEach((file) => formData.append("files[]", file));
  
    updateStatus("Uploading files...");
    progressBarContainer.style.display = "block";
    progressBar.style.width = "0%";
  
    fetch("/upload", {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((err) => {
                    throw err;
                });
            }
            return response.json();
        }) 
        .then((data) => {
            console.log("Received data from server:", data);
            updateStatus(data.message);
            downloadButton.style.display = "inline-block";
            progressBarContainer.style.display = "none";
            downloadFilename = data.filename;
            if (data.file_tree) {
                displayFileTree(data.file_tree);
            } else {
                console.error('File tree data is missing from the response');
                document.getElementById('fileTree').style.display = 'none';
            }
            if (data.preview_content) {
                displayPreview(data.preview_content);
            } else {
                console.error('Preview content is missing from the response');
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            updateStatus(
                "An error occurred during upload: " +
                (error.error || error.message || "Unknown error")
            );
            progressBarContainer.style.display = "none";
        });
  });
  
  // Initialize highlight.js 
  function initializeHighlightJS() {
    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    } else {
      console.warn('highlight.js is not loaded. Syntax highlighting may not work.');
    }
  }

  // Call initializeHighlightJS after a short delay to ensure scripts have loaded
  setTimeout(initializeHighlightJS, 100);

  function applyHighlighting() {
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }

  // function displayPreview(content) {
  //   const previewElement = document.getElementById('preview');
  //   if (previewElement) {
  //     // Create file content element
  //     const fileContentElement = document.createElement('div');
  //     fileContentElement.className = 'file-content';
      
  //     // Split the content into sections
  //     const sections = content.split('\n# ');

  //     sections.forEach((section, index) => {
  //       if (index === 0 && !section.startsWith('# ')) {
  //         // This is likely the file tree, so we'll wrap it in a code block
  //         const fileTreeElement = document.createElement('div');
  //         fileTreeElement.className = 'file-tree';
  //         const pre = document.createElement('pre');
  //         const code = document.createElement('code');
  //         code.className = 'language-plaintext';
  //         code.textContent = section.trim();
  //         pre.appendChild(code);
  //         fileTreeElement.appendChild(pre);
  //         fileContentElement.appendChild(fileTreeElement);
  //       } else {
  //         // This is a file content section
  //         const sectionElement = document.createElement('div');
  //         sectionElement.className = 'file-section';
          
  //         const lines = section.split('\n');
  //         const header = lines.shift(); // Remove and store the first line as header
          
  //         const headerElement = document.createElement('h3');
  //         headerElement.className = 'file-header';
  //         headerElement.textContent = (index === 0 ? '# ' : '') + header.trim();
          
  //         const bodyElement = document.createElement('pre');
  //         bodyElement.className = 'file-body';
  //         const codeElement = document.createElement('code');
  //         codeElement.textContent = lines.join('\n').trim();
  //         bodyElement.appendChild(codeElement);
          
  //         sectionElement.appendChild(headerElement);
  //         sectionElement.appendChild(bodyElement);
  //         fileContentElement.appendChild(sectionElement);
  //       }
  //     });
      
  //     // Clear previous content and add new elements
  //     previewElement.innerHTML = '';
  //     previewElement.appendChild(fileContentElement);

  //     // Apply syntax highlighting
  //     document.querySelectorAll('pre code').forEach((block) => {
  //       hljs.highlightElement(block);
  //     });
  //   } else {
  //     console.error('Preview element not found');
  //   }
  // }

//   function displayPreview(content) {
//     const previewElement = document.getElementById('preview');
//     if (previewElement) {
//         // Create file content element
//         const fileContentElement = document.createElement('div');
//         fileContentElement.className = 'file-content';

//         // Split the content into sections
//         const sections = content.split('\n# ');

//         sections.forEach((section, index) => {
//             if (index === 0) {
//                 // This is the repository name section
//                 const repoNameElement = document.createElement('h2');
//                 repoNameElement.textContent = section.trim();
//                 fileContentElement.appendChild(repoNameElement);
//             } else if (section.startsWith('File Tree')) {
//                 // This is the file tree section
//                 const fileTreeElement = document.createElement('div');
//                 fileTreeElement.className = 'file-tree';
//                 const pre = document.createElement('pre');
//                 const code = document.createElement('code');
//                 code.className = 'language-plaintext';
//                 code.textContent = section.split('```\n')[1].split('\n```')[0].trim();
//                 pre.appendChild(code);
//                 fileTreeElement.appendChild(pre);
//                 fileContentElement.appendChild(fileTreeElement);
//             } else {
//                 // This is a file content section
//                 const sectionElement = document.createElement('div');
//                 sectionElement.className = 'file-section';
//                 const lines = section.split('\n');
//                 const header = lines.shift(); // Remove and store the first line as header
//                 const headerElement = document.createElement('h3');
//                 headerElement.className = 'file-header';
//                 headerElement.textContent = (index === 0 ? '# ' : '') + header.trim();
//                 const bodyElement = document.createElement('pre');
//                 bodyElement.className = 'file-body';
//                 const codeElement = document.createElement('code');
//                 codeElement.textContent = lines.join('\n').trim();
//                 bodyElement.appendChild(codeElement);
//                 sectionElement.appendChild(headerElement);
//                 sectionElement.appendChild(bodyElement);
//                 fileContentElement.appendChild(sectionElement);
//             }
//         });

//         // Clear previous content and add new elements
//         previewElement.innerHTML = '';
//         previewElement.appendChild(fileContentElement);

//         // Apply syntax highlighting
//         document.querySelectorAll('pre code').forEach((block) => {
//             hljs.highlightElement(block);
//         });
//     } else {
//         console.error('Preview element not found');
//     }
// }

// function displayPreview(content) {
//   const previewElement = document.getElementById('preview');
//   if (previewElement) {
//       // Create file content element
//       const fileContentElement = document.createElement('div');
//       fileContentElement.className = 'file-content';

//       // Split the content into sections
//       const sections = content.split('\n# ');

//       sections.forEach((section, index) => {
//           if (index === 0) {
//               // This is the repository name section
//               const repoNameElement = document.createElement('h2');
//               repoNameElement.textContent = section.trim();
//               fileContentElement.appendChild(repoNameElement);
//           } else if (section.startsWith('File Tree')) {
//               // This is the file tree section
//               const fileTreeElement = document.createElement('div');
//               fileTreeElement.className = 'file-tree';
//               const pre = document.createElement('pre');
//               const code = document.createElement('code');
//               code.className = 'language-plaintext';
//               code.textContent = section.split('```\n')[1].split('\n```')[0].trim();
//               pre.appendChild(code);
//               fileTreeElement.appendChild(pre);
//               fileContentElement.appendChild(fileTreeElement);
//           } else {
//               // This is a file content section
//               const sectionElement = document.createElement('div');
//               sectionElement.className = 'file-section';
//               const lines = section.split('\n');
//               const header = lines.shift(); // Remove and store the first line as header
//               const headerElement = document.createElement('h3');
//               headerElement.className = 'file-header';
//               headerElement.textContent = header.trim();
//               const bodyElement = document.createElement('pre');
//               bodyElement.className = 'file-body';
//               const codeElement = document.createElement('code');
//               codeElement.textContent = lines.join('\n').trim();
//               bodyElement.appendChild(codeElement);
//               sectionElement.appendChild(headerElement);
//               sectionElement.appendChild(bodyElement);
//               fileContentElement.appendChild(sectionElement);
//           }
//       });

//       // Clear previous content and add new elements
//       previewElement.innerHTML = '';
//       previewElement.appendChild(fileContentElement);

//       // Apply syntax highlighting
//       document.querySelectorAll('pre code').forEach((block) => {
//           hljs.highlightElement(block);
//       });
//   } else {
//       console.error('Preview element not found');
//   }
// }

function displayPreview(content) {
  const previewElement = document.getElementById('preview');
  if (previewElement) {
      // Create file content element
      const fileContentElement = document.createElement('div');
      fileContentElement.className = 'file-content';

      // Split the content into sections
      const sections = content.split('\n# ');

      sections.forEach((section, index) => {
          if (index === 0) {
              // This is the repository name section
              const repoNameElement = document.createElement('h2');
              repoNameElement.textContent = section.trim();
              fileContentElement.appendChild(repoNameElement);
          } else if (section.startsWith('File Tree')) {
              // This is the file tree section
              const fileTreeElement = document.createElement('div');
              fileTreeElement.className = 'file-tree';
              const pre = document.createElement('pre');
              const code = document.createElement('code');
              code.className = 'language-plaintext';
              code.textContent = section.split('```\n')[1].split('\n```')[0].trim();
              pre.appendChild(code);
              fileTreeElement.appendChild(pre);
              fileContentElement.appendChild(fileTreeElement);
          } else {
              // This is a file content section
              const sectionElement = document.createElement('div');
              sectionElement.className = 'file-section';
              const lines = section.split('\n');
              const header = lines.shift(); // Remove and store the first line as header
              const headerElement = document.createElement('h3');
              headerElement.className = 'file-header';
              headerElement.textContent = header.trim();
              const bodyElement = document.createElement('pre');
              bodyElement.className = 'file-body';
              const codeElement = document.createElement('code');
              codeElement.textContent = lines.join('\n').trim();
              bodyElement.appendChild(codeElement);
              sectionElement.appendChild(headerElement);
              sectionElement.appendChild(bodyElement);
              fileContentElement.appendChild(sectionElement);
          }
      });

      // Clear previous content and add new elements
      previewElement.innerHTML = '';
      previewElement.appendChild(fileContentElement);

      // Apply syntax highlighting
      document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
      });
  } else {
      console.error('Preview element not found');
  }
}

  function updateGallery() {
    let gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    uploadedFiles.forEach((file, index) => {
      let div = document.createElement("div");
      div.textContent = `${file.webkitRelativePath || file.name} (${formatFileSize(file.size)})`;
      // Create remove icon
      let removeIcon = document.createElement("span");
      removeIcon.textContent = "X";
      removeIcon.classList.add("remove-icon");
      removeIcon.addEventListener("click", function () {
        removeFile(index);
      });

      div.appendChild(removeIcon);
      gallery.appendChild(div);
    });

    document.getElementById("fileCount").textContent =
      `${uploadedFiles.length} files selected`;
  }

  function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateGallery();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  }

  function updateStatus(message) {
    statusDiv.textContent = message;
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener("drop", handleDrop, false);
  fileInput.addEventListener("change", handleFiles, false);

  function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles({ target: { files: files } });
  }

  function displayFileTree(fileTree) {
    console.log("Displaying file tree:", fileTree);
    let treeContainer = document.getElementById('fileTree');
    if (!treeContainer) {
        console.error('File tree container not found');
        return;
    }
    if (fileTree && fileTree.trim() !== '') {
        treeContainer.innerHTML = '<pre>' + fileTree + '</pre>';
        treeContainer.style.display = 'block';
    } else {
        console.warn('File tree is empty');
        treeContainer.style.display = 'none';
    }
}

  downloadButton.addEventListener("click", function () {
    window.location.href = `/download/${downloadFilename}`;
  });
});
```

# app/templates/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>repo2md</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/styles.css') }}" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="header-title">repo2md</h1>
        </div>
    </header> 
    <main class="main">
        <div class="container">
            <div class="two-column-layout">
                <div class="column left-column">
                    <div class="card">
                        <div class="card-body">
                            <div class="upload-area" id="drop-area">
                                <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <p class="upload-text">Drag and drop your repository folder here</p>
                                <p class="upload-subtext">or</p>
                                <label for="fileElem" class="btn btn-primary">Select Repository</label>
                                <input type="file" id="fileElem" multiple webkitdirectory directory hidden />
                            </div>
                            <div id="gallery" class="file-gallery"></div>
                            <div class="file-count" id="fileCount">0 files selected</div>
                            <div class="action-buttons">
                                <button id="uploadBtn" class="btn btn-primary">Upload Files</button>
                                <button id="downloadBtn" class="btn btn-secondary" style="display: none">Download Combined File</button>
                            </div>
                            <div id="status" class="status"></div>
                            <div id="progress-bar-container" class="progress-container" style="display: none">
                                <div id="progress-bar" class="progress-bar"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column right-column">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">Preview</h2>
                        </div>
                        <div class="card-body-preview">
                            <div id="preview" class="preview"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/html.min.js"></script>
    <script type="text/javascript" src="{{ url_for('static', filename='js/script.js') }}"></script>
</body>
</html>

```

