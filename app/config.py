import os
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    OUTPUT_FILE = 'combined_output.md'
    ALLOWED_EXTENSIONS = {'py', 'js','jsx','ts','tsx','txt','md', 'html', 'css', 'java', 'cpp', 'h', 'c', 'ts', 'tsx', 'go', 'rs', 'rb', 'php', 'scala', 'kt', 'swift', 'r', 'sql'}
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
        'log', 'lock', 'bak', 'tmp', 'swp', 'swo', 'DS_Store', '.DS_Store', 'min.js', 'min.css', 'map'
    }
    EXCLUDED_DIRECTORIES = {'node_modules', '__pycache__', '.git', '.svn', '.hg', '.idea', '.vscode', 'build', 'dist', 'target'}
    MAX_CONTENT_LENGTH = 1000 * 1024 * 1024  # 1000 MB
