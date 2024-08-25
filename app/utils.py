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