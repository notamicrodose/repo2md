# repo2md

repo2md is a web app built with python (flask), html, css and vanilla js that allows users to upload github repos (folders) and combine them into a single Markdown file to make it easier to share code with LLMs.

Its simple, but it does the job. 

Contributions are welcome!

## Features

- Drag and drop file uploader
- Deselect unwanted file before downloading
- Combines various file types into a single Markdown file via simple UI
- Download the combined md file
- Excludes certain file types from the combined file (node_modules, .git, etc.)
- Creates a file tree of the repo for the LLM to know the structure of the project

## Roadmap

- Display a preview of the generated markdown file
- Add ability to deselect specific folders from the output

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

## Creator
Gabriel Kripalani (gabriel@agenticc.com)

## License
[MIT](https://choosealicense.com/licenses/mit/)
