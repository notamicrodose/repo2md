# File Combiner

File Combiner is a Flask-based web application that allows users to upload multiple files and combine them into a single Markdown file.

I have created this tool to make it easier for myself to share code with LLMs. Its very basic, but it does the job.

## Features

- Drag and drop file upload
- Progress bar for upload status
- Combines various file types into a single Markdown file
- Download the combined file

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

## Contributing

Contributions are welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
