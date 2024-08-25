# repo2gh

repo2gh is a Flask-based web app that allows users to upload github repos (essentially folders) and combine them into a single Markdown file to make it easier to share code with LLMs. Its basic, but it does the job. Contributions are welcome!

## Features

- Drag and drop file upload
- Progress bar for upload status
- Combines various file types into a single Markdown file
- Download the combined file
- Excludes certain file types from the combined file (node_modules, .git, etc.)

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

## License
[MIT](https://choosealicense.com/licenses/mit/)
