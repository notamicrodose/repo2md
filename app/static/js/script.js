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

    // Extract the top-level directory path
    topLevelPath = (uploadedFiles.length > 0) ? uploadedFiles[0].webkitRelativePath.split('/')[0] : null;

    // Extract top-level folders inside the main directory, excluding files
    uploadedFiles.forEach(file => {
        const relativePath = file.webkitRelativePath || file.name;
        const pathParts = relativePath.split("/");

        // Only include top-level directories
        if (pathParts.length > 1 && pathParts[0] === topLevelPath && pathParts.length > 2) {
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
        div.textContent = folder;
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
        const folderName = file.webkitRelativePath.split('/')[1];
        return allFolders.get(folderName);
    });

    displayedFiles.forEach((file, index) => {
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
    const folderPath = file.webkitRelativePath.split('/')[1];
    const filesInSameFolder = uploadedFiles.some(f => f.webkitRelativePath.split('/')[1] === folderPath);

    if (!filesInSameFolder) {
        allFolders.delete(folderPath);
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
        const folderName = file.webkitRelativePath.split('/')[1];
        return allFolders.get(folderName);
    });

    if (selectedFiles.length === 0) {
        updateStatus("No files selected");
        return;
    }

    let formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files[]", file));

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

// document.addEventListener("DOMContentLoaded", function () {
//   let dropArea = document.getElementById("drop-area");
//   let uploadButton = document.getElementById("uploadBtn");
//   let downloadButton = document.getElementById("downloadBtn");
//   let statusDiv = document.getElementById("status");
//   let progressBar = document.getElementById("progress-bar");
//   let progressBarContainer = document.getElementById("progress-bar-container");
//   let fileInput = document.getElementById("fileElem");

//   const excludedExtensions = [
//     "png",
//     "jpg",
//     "jpeg",
//     "gif",
//     "bmp",
//     "tiff",
//     "svg",
//     "webp",
//     "mp4",
//     "avi",
//     "mov",
//     "mkv",
//     "flv",
//     "wmv",
//     "mp3",
//     "wav",
//     "aac",
//     "flac",
//     "ogg",
//     "pdf",
//     "doc",
//     "docx",
//     "ppt",
//     "pptx",
//     "xls",
//     "xlsx",
//     "jar",
//     "zip",
//     "tar",
//     "gz",
//     "rar",
//     "7z",
//     "exe",
//     "dll",
//     "bin",
//     "sh",
//     "bat",
//     "cmd",
//     "ini",
//     "cfg",
//     "conf",
//     "json",
//     "yaml",
//     "yml",
//     "toml",
//     "log",
//     "lock",
//     "bak",
//     "tmp",
//     "swp",
//     "swo",
//     "DS_Store",
//     ".DS_Store",
//   ];

//   const excludedDirectories = [
//     "node_modules",
//     "__pycache__",
//     ".git",
//     ".svn",
//     ".hg",
//     ".idea",
//     ".vscode",
//     "build",
//     "dist",
//     "target",
//   ];

//   let uploadedFiles = [];
//   let downloadFilename = "";

//   function preventDefaults(e) {
//     e.preventDefault();
//     e.stopPropagation();
//   }

//   function highlight() {
//     dropArea.classList.add("highlight");
//   }

  

//   function unhighlight() {
//     dropArea.classList.remove("highlight");
//   }

//   function isAllowedFile(file) {
//     const extension = file.name.split(".").pop().toLowerCase();
//     const path = file.webkitRelativePath || file.name;
//     const directories = path.split("/");

//     for (let dir of directories) {
//       if (excludedDirectories.includes(dir)) {
//         return false;
//       }
//     }

//     return !excludedExtensions.includes(extension);
//   }
//   let topLevelPath = null; // Define topLevelPath in a scope accessible by both functions

//   function handleFiles(e) {
//     let files = e.target.files || e.dataTransfer.files;
//     uploadedFiles = Array.from(files).filter(isAllowedFile);

//     // Extract the top-level directory path
//     topLevelPath = (uploadedFiles.length > 0) ? uploadedFiles[0].webkitRelativePath.split('/')[0] : null;

//     // Extract top-level folders inside the main directory, excluding files
//     topLevelFolders = new Set(uploadedFiles.map(file => {
//         const relativePath = file.webkitRelativePath || file.name;
//         const pathParts = relativePath.split("/");

//         // Only include top-level directories
//         if (pathParts.length > 1 && pathParts[0] === topLevelPath && pathParts.length > 2) {
//             return pathParts[1];  // Returns the directory name
//         }
//         return null;
//     }).filter(folder => folder !== null));

//     updateFolderGallery();
//     updateGallery();
//   }

//   function updateFolderGallery() {
//     let folderGallery = document.getElementById("folderGallery");
//     folderGallery.innerHTML = ""; // Clear current folder display
    
//     // Update the gallery with the remaining top-level folders
//     Array.from(topLevelFolders).forEach((folder) => {
//         let div = document.createElement("div");
//         div.textContent = folder;

//         // Create remove icon
//         let removeIcon = document.createElement("span");
//         removeIcon.textContent = "X";
//         removeIcon.classList.add("remove-icon");
//         removeIcon.addEventListener("click", function () {
//             removeFolder(folder);
//         });

//         div.appendChild(removeIcon);
//         folderGallery.appendChild(div);
//     });
//   }

//   function removeFolder(folder) {
//     // Remove the files belonging to the deselected folder
//     uploadedFiles = uploadedFiles.filter(file => {
//         const pathParts = (file.webkitRelativePath || file.name).split("/");
//         const topLevelFolder = pathParts.length > 1 ? pathParts[1] : "";
//         return topLevelFolder !== folder;
//     });

//     // Remove the folder from topLevelFolders
//     topLevelFolders.delete(folder);

//     // Update the folder and file galleries
//     updateFolderGallery();
//     updateGallery();
//   }

//   function updateGallery() {
//     let gallery = document.getElementById("gallery");
//     gallery.innerHTML = "";
//     uploadedFiles.forEach((file, index) => {
//         let div = document.createElement("div");
//         div.textContent = `${file.webkitRelativePath || file.name} (${formatFileSize(file.size)})`;

//         // Create remove icon
//         let removeIcon = document.createElement("span");
//         removeIcon.textContent = "X";
//         removeIcon.classList.add("remove-icon");
//         removeIcon.addEventListener("click", function () {
//             removeFile(index);
//         });

//         div.appendChild(removeIcon);
//         gallery.appendChild(div);
//     });

//     document.getElementById("fileCount").textContent =
//       `${uploadedFiles.length} files selected`;
//   }

//   function removeFile(index) {
//     const removedFile = uploadedFiles[index];
//     uploadedFiles.splice(index, 1);

//     // Check if this was the last file in its folder
//     const folderPath = removedFile.webkitRelativePath.split('/')[1];
//     const filesInSameFolder = uploadedFiles.some(file => file.webkitRelativePath.split('/')[1] === folderPath);

//     if (!filesInSameFolder) {
//       topLevelFolders.delete(folderPath);
//     }

//     updateFolderGallery();
//     updateGallery();
//   }






// uploadButton.addEventListener("click", function () {
//   if (uploadedFiles.length === 0) {
//       updateStatus("No files selected");
//       return;
//   }

//   let formData = new FormData();
//   uploadedFiles.forEach((file) => formData.append("files[]", file));

//   updateStatus("Uploading files...");
//   progressBarContainer.style.display = "block";
//   progressBar.style.width = "0%";

//   fetch("/upload", {
//       method: "POST",
//       body: formData,
//   })
//       .then((response) => {
//           if (!response.ok) {
//               return response.json().then((err) => {
//                   throw err;
//               });
//           }
//           return response.json();
//       })
//       .then((data) => {
//           console.log("Received data from server:", data);
//           updateStatus(data.message);
//           downloadButton.style.display = "inline-block";
//           progressBarContainer.style.display = "none";
//           downloadFilename = data.filename;
//           if (data.file_tree) {
//               displayFileTree(data.file_tree);
//           } else {
//               console.error('File tree data is missing from the response');
//               document.getElementById('fileTree').style.display = 'none';
//           }
//           if (data.preview_content) {
//               displayPreview(data.preview_content);
//           } else {
//               console.error('Preview content is missing from the response');
//           }
//       })
//       .catch((error) => {
//           console.error("Error:", error);
//           updateStatus(
//               "An error occurred during upload: " +
//               (error.error || error.message || "Unknown error")
//           );
//           progressBarContainer.style.display = "none";
//       });
// });


//   // uploadButton.addEventListener("click", function () {
//   //   if (uploadedFiles.length === 0) {
//   //       updateStatus("No files selected");
//   //       return;
//   //   }
  
//   //   let formData = new FormData();
//   //   uploadedFiles.forEach((file) => formData.append("files[]", file));
  
//   //   updateStatus("Uploading files...");
//   //   progressBarContainer.style.display = "block";
//   //   progressBar.style.width = "0%";
  
//   //   fetch("/upload", {
//   //       method: "POST",
//   //       body: formData,
//   //   })
//   //       .then((response) => {
//   //           if (!response.ok) {
//   //               return response.json().then((err) => {
//   //                   throw err;
//   //               });
//   //           }
//   //           return response.json();
//   //       }) 
//   //       .then((data) => {
//   //           console.log("Received data from server:", data);
//   //           updateStatus(data.message);
//   //           downloadButton.style.display = "inline-block";
//   //           progressBarContainer.style.display = "none";
//   //           downloadFilename = data.filename;
//   //           if (data.file_tree) {
//   //               displayFileTree(data.file_tree);
//   //           } else {
//   //               console.error('File tree data is missing from the response');
//   //               document.getElementById('fileTree').style.display = 'none';
//   //           }
//   //           if (data.preview_content) {
//   //               displayPreview(data.preview_content);
//   //           } else {
//   //               console.error('Preview content is missing from the response');
//   //           }
//   //       })
//   //       .catch((error) => {
//   //           console.error("Error:", error);
//   //           updateStatus(
//   //               "An error occurred during upload: " +
//   //               (error.error || error.message || "Unknown error")
//   //           );
//   //           progressBarContainer.style.display = "none";
//   //       });
//   // });
  
//   // Initialize highlight.js 
//   function initializeHighlightJS() {
//     if (typeof hljs !== 'undefined') {
//       hljs.highlightAll();
//     } else {
//       console.warn('highlight.js is not loaded. Syntax highlighting may not work.');
//     }
//   }

//   // Call initializeHighlightJS after a short delay to ensure scripts have loaded
//   setTimeout(initializeHighlightJS, 100);

//   function applyHighlighting() {
//     if (typeof hljs !== 'undefined') {
//       document.querySelectorAll('pre code').forEach((block) => {
//         hljs.highlightElement(block);
//       });
//     }
//   }

//   uploadButton.addEventListener("click", function () {
//     if (uploadedFiles.length === 0) {
//         updateStatus("No files selected");
//         return;
//     }

//     let formData = new FormData();
//     uploadedFiles.forEach((file) => formData.append("files[]", file));

//     updateStatus("Uploading files...");
//     progressBarContainer.style.display = "block";
//     progressBar.style.width = "0%";

//     fetch("/upload", {
//         method: "POST",
//         body: formData,
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 return response.json().then((err) => {
//                     throw err;
//                 });
//             }
//             return response.json();
//         })
//         .then((data) => {
//             console.log("Received data from server:", data);
//             updateStatus(data.message);
//             downloadButton.style.display = "inline-block";
//             progressBarContainer.style.display = "none";
//             downloadFilename = data.filename;
//             if (data.file_tree) {
//                 displayFileTree(data.file_tree);
//             } else {
//                 console.error('File tree data is missing from the response');
//                 document.getElementById('fileTree').style.display = 'none';
//             }
//             if (data.preview_content) {
//                 displayPreview(data.preview_content, data.repo_name);  // Pass repo_name to displayPreview
//             } else {
//                 console.error('Preview content is missing from the response');
//             }
//         })
//         .catch((error) => {
//             console.error("Error:", error);
//             updateStatus(
//                 "An error occurred during upload: " +
//                 (error.error || error.message || "Unknown error")
//             );
//             progressBarContainer.style.display = "none";
//         });
// });

// // Update the displayPreview function to accept repo_name as a parameter
// function displayPreview(content, repo_name) {
//     const previewElement = document.getElementById('preview');
//     if (previewElement) {
//         const fileContentElement = document.createElement('div');
//         fileContentElement.className = 'file-content';

//     const sections = content.split('\n# ');

//     sections.forEach((section, index) => {
//       if (index === 0) {
//         const repoNameElement = document.createElement('h2');
//         repoNameElement.textContent = section.trim();
//         fileContentElement.appendChild(repoNameElement);
//       } else if (section.startsWith('File Tree')) {
//         const fileTreeElement = document.createElement('div');
//         fileTreeElement.className = 'file-tree';
//         const pre = document.createElement('pre');
//         const code = document.createElement('code');
//         code.className = 'language-plaintext';
//         code.textContent = section.split('```\n')[1].split('\n```')[0].trim();
//         pre.appendChild(code);
//         fileTreeElement.appendChild(pre);
//         fileContentElement.appendChild(fileTreeElement);
//       } else {
//         const sectionElement = document.createElement('div');
//         sectionElement.className = 'file-section';
//         const lines = section.split('\n');
//         const header = lines.shift();
//         const headerElement = document.createElement('h3');
//         headerElement.className = 'file-header';
//         headerElement.textContent = header.trim();
//         sectionElement.appendChild(headerElement);

//         const contentElement = document.createElement('div');
//         contentElement.className = 'file-content';

//         if (header.trim().toLowerCase().endsWith('.md')) {
//           const markdownContent = lines.join('\n').match(/<markdown>([\s\S]*?)<\/markdown>/)[1];
//           const unescapedContent = markdownContent.replace(/^\\#/gm, '#');
//           contentElement.innerHTML = marked.parse(unescapedContent);
//         } else {
//           const bodyElement = document.createElement('pre');
//           bodyElement.className = 'file-body';
//           const codeElement = document.createElement('code');
          
//           const match = lines.join('\n').match(/```(\w+)?\n([\s\S]*?)\n```/);
//           if (match) {
//             let language = match[1] || 'plaintext';
//             const codeContent = match[2];
            
//             codeElement.className = `language-${language}`;
//             codeElement.textContent = codeContent.trim();
//           } else {
//             codeElement.className = 'language-plaintext';
//             codeElement.textContent = lines.join('\n').trim();
//           }
          
//           bodyElement.appendChild(codeElement);
//           contentElement.appendChild(bodyElement);
//         }
        
//         sectionElement.appendChild(contentElement);
//         fileContentElement.appendChild(sectionElement);
//       }
//     });

//     previewElement.innerHTML = '';
//     previewElement.appendChild(fileContentElement);

//     if (typeof hljs !== 'undefined') {
//       document.querySelectorAll('pre code').forEach((block) => {
//         hljs.highlightElement(block);
//       });
//     } else {
//       console.warn('highlight.js is not loaded. Syntax highlighting may not work.');
//     }
//   } else {
//     console.error('Preview element not found');
//   }
// }




//   function removeFile(index) {
//     uploadedFiles.splice(index, 1);
//     updateGallery();
//   }

//   function formatFileSize(bytes) {
//     if (bytes < 1024) return bytes + " bytes";
//     else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
//     else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
//     else return (bytes / 1073741824).toFixed(1) + " GB";
//   }

//   function updateStatus(message) {
//     statusDiv.textContent = message;
//   }

//   ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
//     dropArea.addEventListener(eventName, preventDefaults, false);
//   });

//   ["dragenter", "dragover"].forEach((eventName) => {
//     dropArea.addEventListener(eventName, highlight, false);
//   });

//   ["dragleave", "drop"].forEach((eventName) => {
//     dropArea.addEventListener(eventName, unhighlight, false);
//   });

//   dropArea.addEventListener("drop", handleDrop, false);
//   fileInput.addEventListener("change", handleFiles, false);

//   function handleDrop(e) {
//     let dt = e.dataTransfer;
//     let files = dt.files;
//     handleFiles({ target: { files: files } });
//   }
 
//   function displayFileTree(fileTree) {
//     console.log("Displaying file tree:", fileTree);
//     let treeContainer = document.getElementById('fileTree');
//     if (!treeContainer) {
//         console.error('File tree container not found');
//         return;
//     }
//     if (fileTree && fileTree.trim() !== '') {
//         treeContainer.innerHTML = '<pre>' + fileTree + '</pre>';
//         treeContainer.style.display = 'block';
//     } else {
//         console.warn('File tree is empty');
//         treeContainer.style.display = 'none';
//     }
// }

//   downloadButton.addEventListener("click", function () {
//     window.location.href = `/download/${downloadFilename}`;
//   });
// });