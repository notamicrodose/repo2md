# repo2md

repo2md is a web app built with python, html, css and vanilla js that allows users to upload github repos (folders) and combine them into a single Markdown file to make it easier to share code with LLMs. Feedback: gabriel@agenticc.com

## Utility
The web ui lets you combine a repository into a single properly formatted .md file. It automatically excludes folders such as `node_modules`, `__pycache__` and a lot of file extensions unrelated to the sourcecode. You also have the option to manually exclude specific directories or files.

## Features

- Drag and drop file uploader
- Select/deselect folders and files before combining files
- Preview the generated markdown file before downloading
- Syntax highlighting
- Excludes unwanted directories and file types (node_modules, .git, etc.)
- Includes a file tree of the repo in the output file

## Roadmap

- Integration with GitHub
- API access
- Refactoring

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/notamicrodose/repo2gh.git
   cd repo2gh
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Run the application:
   ```
   python run.py
   ```

2. Open a web browser and go to `http://localhost:5000`

3. Use the interface to upload files, combine them, and download the result.
