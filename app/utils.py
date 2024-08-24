import os
import asyncio
from werkzeug.utils import secure_filename
from app.config import Config
import logging

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

async def process_file(file_path, relative_path):
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

# async def process_directory(directory_path, base_path):
#     tasks = []
#     for root, dirs, files in os.walk(directory_path):
#         # Remove excluded directories
#         dirs[:] = [d for d in dirs if not excluded_directory(os.path.join(root, d))]

#         for file in files:
#             file_path = os.path.join(root, file)
#             relative_path = os.path.relpath(file_path, base_path)

#             if not excluded_directory(relative_path) and allowed_file(file) and not excluded_file(file):
#                 tasks.append(process_file(file_path, relative_path))

#     if not tasks:
#         logger.warning("No files to process in the directory.")
#         return "No files were found to combine."

#     results = await asyncio.gather(*tasks)
#     return ''.join(results)

async def process_directory(directory_path, base_path):
    tasks = []
    repo_name = os.path.basename(directory_path)
    content = f"# Repository: {repo_name}\n\n"

    for root, dirs, files in os.walk(directory_path):
        # Remove excluded directories
        dirs[:] = [d for d in dirs if not excluded_directory(os.path.join(root, d))]

        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, directory_path)

            if not excluded_directory(relative_path) and allowed_file(file) and not excluded_file(file):
                tasks.append(process_file(file_path, relative_path))

    if not tasks:
        logger.warning("No files to process in the directory.")
        return f"# Repository: {repo_name}\n\nNo files were found to combine."

    results = await asyncio.gather(*tasks)
    content += ''.join(results)
    return content

# def async_combine_files(directory_path):
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     try:
#         result = loop.run_until_complete(process_directory(directory_path, directory_path))
#     except Exception as e:
#         logger.error(f"Error in async_combine_files: {str(e)}")
#         raise
#     finally:
#         loop.close()
#     return result

def async_combine_files(directory_path):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        content = loop.run_until_complete(process_directory(directory_path, directory_path))
        return content
    except Exception as e:
        logger.error(f"Error in async_combine_files: {str(e)}")
        raise
    finally:
        loop.close()
