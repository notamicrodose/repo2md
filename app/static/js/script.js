document.addEventListener("DOMContentLoaded", function () {
  let dropArea = document.getElementById("drop-area");
  let uploadButton = document.getElementById("uploadBtn");
  let downloadButton = document.getElementById("downloadBtn");
  let statusDiv = document.getElementById("status");
  let progressBar = document.getElementById("progress-bar");
  let progressBarContainer = document.getElementById("progress-bar-container");
  let fileInput = document.getElementById("fileElem");

  const excludedExtensions = [
    "png", "jpg", "jpeg", "gif", "bmp", "tiff", "svg", "webp",
    "mp4", "avi", "mov", "mkv", "flv", "wmv",
    "mp3", "wav", "aac", "flac", "ogg",
    "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
    "jar", "zip", "tar", "gz", "rar", "7z",
    "exe", "dll", "bin", "sh", "bat", "cmd",
    "ini", "cfg", "conf", "json", "yaml", "yml", "toml",
    "log", "lock", "bak", "tmp", "swp", "swo", "DS_Store", ".DS_Store"
  ];

  const excludedDirectories = [
    "node_modules", "__pycache__", ".git", ".svn", ".hg", ".idea", ".vscode",
    "build", "dist", "target"
  ];

  let uploadedFiles = [];
  let downloadFilename = "";
  let topLevelPath = null;
  let allFolders = new Map(); // Map to store all folders and their selection status
  let originalFolderName = ""; // Store the original folder name

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }


  function handleTopLevelFile(file) {
    if (!allFolders.has('_root_')) {
        allFolders.set('_root_', true);
    }
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

    // Extract the top-level directory path
    // topLevelPath = (uploadedFiles.length > 0) ? uploadedFiles[0].webkitRelativePath.split('/')[0] : null;
    if (uploadedFiles.length > 0) {
      const firstFilePath = uploadedFiles[0].webkitRelativePath || uploadedFiles[0].name;
      const pathParts = firstFilePath.split('/');
      topLevelPath = pathParts[0];
      originalFolderName = topLevelPath; // Store the original folder name
    } else {
      topLevelPath = null;
      originalFolderName = "";
    }

    // Handle top-level files and extract folders
    uploadedFiles.forEach(file => {
        const relativePath = file.webkitRelativePath || file.name;
        const pathParts = relativePath.split("/");

        if (pathParts.length === 2 && pathParts[0] === topLevelPath) {
            // This is a top-level file
            handleTopLevelFile(file);
        } else if (pathParts.length > 2 && pathParts[0] === topLevelPath) {
            // This is a file in a subdirectory
            const folderName = pathParts[1];
            if (!allFolders.has(folderName)) {
                allFolders.set(folderName, true); // Initialize as selected
            }
        }
    });

    updateFolderGallery();
    updateFileGallery();
  }

  function updateFolderGallery() {
    let folderGallery = document.getElementById("folderGallery");
    folderGallery.innerHTML = ""; // Clear current folder display
    
    // Update the gallery with all folders
    allFolders.forEach((isSelected, folder) => {
        let div = document.createElement("div");
        div.textContent = folder === '_root_' ? 'root' : folder;
        div.classList.toggle('deselected', !isSelected);

        // Create toggle icon
        let toggleIcon = document.createElement("span");
        toggleIcon.textContent = isSelected ? "✓" : "×";
        toggleIcon.classList.add("toggle-icon");
        toggleIcon.addEventListener("click", function () {
            toggleFolder(folder);
        });

        div.appendChild(toggleIcon);
        folderGallery.appendChild(div);
    });
  }

  function toggleFolder(folder) {
    const isSelected = allFolders.get(folder);
    allFolders.set(folder, !isSelected);
    updateFolderGallery();
    updateFileGallery();
  }

  function updateFileGallery() {
    let gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    let displayedFiles = uploadedFiles.filter(file => {
        const pathParts = file.webkitRelativePath.split('/');
        if (pathParts.length === 2) {
            // Top-level file
            return allFolders.get('_root_');
        } else {
            // File in subdirectory
            const folderName = pathParts[1];
            return allFolders.get(folderName);
        }
    });

    displayedFiles.forEach((file) => {
        let div = document.createElement("div");
        div.textContent = `${file.webkitRelativePath || file.name} (${formatFileSize(file.size)})`;

        // Create remove icon
        let removeIcon = document.createElement("span");
        removeIcon.textContent = "X";
        removeIcon.classList.add("remove-icon");
        removeIcon.addEventListener("click", function () {
            removeFile(file);
        });

        div.appendChild(removeIcon);
        gallery.appendChild(div);
    });

    document.getElementById("fileCount").textContent =
      `${displayedFiles.length} files selected`;
  }

  function removeFile(file) {
    const index = uploadedFiles.indexOf(file);
    if (index > -1) {
        uploadedFiles.splice(index, 1);
    }

    // Check if this was the last file in its folder
    const pathParts = file.webkitRelativePath.split('/');
    if (pathParts.length === 2) {
        // This is a top-level file
        const rootFiles = uploadedFiles.filter(f => f.webkitRelativePath.split('/').length === 2);
        if (rootFiles.length === 0) {
            allFolders.delete('_root_');
        }
    } else {
        const folderPath = pathParts[1];
        const filesInSameFolder = uploadedFiles.some(f => f.webkitRelativePath.split('/')[1] === folderPath);
        if (!filesInSameFolder) {
            allFolders.delete(folderPath);
        }
    }

    updateFolderGallery();
    updateFileGallery();
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

  uploadButton.addEventListener("click", function () {
    const selectedFiles = uploadedFiles.filter(file => {
        const pathParts = file.webkitRelativePath.split('/');
        if (pathParts.length === 2) {
            // Top-level file
            return allFolders.get('_root_');
        } else {
            // File in subdirectory
            const folderName = pathParts[1];
            return allFolders.get(folderName);
        }
    });

    if (selectedFiles.length === 0) {
        updateStatus("No files selected");
        return;
    }

    let formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files[]", file));
    formData.append("folder_name", originalFolderName); // Add the original folder name to the form data

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
                displayPreview(data.preview_content, data.repo_name);
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

  function displayPreview(content, repo_name) {
    const previewElement = document.getElementById('preview');
    if (previewElement) {
        const fileContentElement = document.createElement('div');
        fileContentElement.className = 'file-content';

        const sections = content.split('\n# ');

        sections.forEach((section, index) => {
            if (index === 0) {
                const repoNameElement = document.createElement('h2');
                repoNameElement.textContent = section.trim();
                fileContentElement.appendChild(repoNameElement);
            } else if (section.startsWith('File Tree')) {
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
                const sectionElement = document.createElement('div');
                sectionElement.className = 'file-section';
                const lines = section.split('\n');
                const header = lines.shift();
                const headerElement = document.createElement('h3');
                headerElement.className = 'file-header';
                headerElement.textContent = header.trim();
                sectionElement.appendChild(headerElement);

                const contentElement = document.createElement('div');
                contentElement.className = 'file-content';

                if (header.trim().toLowerCase().endsWith('.md')) {
                    const markdownContent = lines.join('\n').match(/<markdown>([\s\S]*?)<\/markdown>/)[1];
                    const unescapedContent = markdownContent.replace(/^\\#/gm, '#');
                    contentElement.innerHTML = marked.parse(unescapedContent);
                } else {
                    const bodyElement = document.createElement('pre');
                    bodyElement.className = 'file-body';
                    const codeElement = document.createElement('code');
                    
                    const match = lines.join('\n').match(/```(\w+)?\n([\s\S]*?)\n```/);
                    if (match) {
                        let language = match[1] || 'plaintext';
                        const codeContent = match[2];
                        
                        codeElement.className = `language-${language}`;
                        codeElement.textContent = codeContent.trim();
                    } else {
                        codeElement.className = 'language-plaintext';
                        codeElement.textContent = lines.join('\n').trim();
                    }
                    
                    bodyElement.appendChild(codeElement);
                    contentElement.appendChild(bodyElement);
                }
                
                sectionElement.appendChild(contentElement);
                fileContentElement.appendChild(sectionElement);
            }
        });

        previewElement.innerHTML = '';
        previewElement.appendChild(fileContentElement);

        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } else {
            console.warn('highlight.js is not loaded. Syntax highlighting may not work.');
        }
    } else {
        console.error('Preview element not found');
    }
  }

  downloadButton.addEventListener("click", function () {
    window.location.href = `/download/${downloadFilename}`;
  });
});
