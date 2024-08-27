// scripts.js
document.addEventListener("DOMContentLoaded", function () {
  let dropArea = document.getElementById("drop-area");
  let uploadButton = document.getElementById("uploadBtn");
  let downloadButton = document.getElementById("downloadBtn");
  let statusDiv = document.getElementById("status");
  let progressBar = document.getElementById("progress-bar");
  let progressBarContainer = document.getElementById("progress-bar-container");
  let fileInput = document.getElementById("fileElem");
  let uploadedFiles = [];
  let downloadFilename = "";
  let topLevelPath = null;
  let allFolders = new Map(); // Map to keep keep track of all folders and their selection status
  let originalFolderName = ""; // Keeping the OG folder name

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

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    let items = e.dataTransfer.items;
    let files = [];

    function traverseFileTree(item, path) {
      return new Promise((resolve) => {
        if (item.isFile) {
          item.file((file) => {
            file.fullPath = path + file.name;
            files.push(file);
            resolve();
          });
        } else if (item.isDirectory) {
          let dirReader = item.createReader();
          dirReader.readEntries((entries) => {
            let entriesPromises = [];
            for (let entr of entries) {
              entriesPromises.push(
                traverseFileTree(entr, path + item.name + "/")
              );
            }
            Promise.all(entriesPromises).then(resolve);
          });
        }
      });
    }

    let entriesPromises = [];
    for (let item of items) {
      item = item.webkitGetAsEntry();
      if (item) {
        entriesPromises.push(traverseFileTree(item, "/"));
      }
    }

    Promise.all(entriesPromises).then(() => {
      handleFiles({ target: { files: files } });
    });
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

  function getTokenCount(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        resolve((text.length/4).toFixed(0)); // roughly estimate the number of tokens 
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function handleFiles(e) {
    let files = e.target.files || e.dataTransfer.files;
    uploadedFiles = Array.from(files).filter(isAllowedFile);
  
    // Build folder structure
    folderStructure = { name: 'root', isSelected: true, children: {} };
  
    if (uploadedFiles.length > 0 && uploadedFiles[0].webkitRelativePath) {
      // Files selected via input
      originalFolderName = uploadedFiles[0].webkitRelativePath.split('/')[0];
  
      const promises = uploadedFiles.map(async (file) => {
        const tokenCount = await getTokenCount(file);
        file.tokenCount = tokenCount;
        const relativePath = file.webkitRelativePath;
        const pathParts = relativePath.split("/");
  
        let currentLevel = folderStructure;
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!currentLevel.children[pathParts[i]]) {
            currentLevel.children[pathParts[i]] = { name: pathParts[i], isSelected: true, children: {} };
          }
          currentLevel = currentLevel.children[pathParts[i]];
        }
      });
  
      Promise.all(promises).then(() => {
        // Initialize allFolders Map
        allFolders = new Map();
        initializeFolderMap(folderStructure, '');
  
        updateFolderGallery();
        updateFileGallery();
      });
    } else {
      // Dropped files
      originalFolderName = 'Dropped Files';
  
      const promises = uploadedFiles.map(async (file) => {
        const tokenCount = await getTokenCount(file);
        file.tokenCount = tokenCount;
        if (!folderStructure.children[originalFolderName]) {
          folderStructure.children[originalFolderName] = { name: originalFolderName, isSelected: true, children: {} };
        }
        folderStructure.children[originalFolderName].children[file.name] = { name: file.name, isSelected: true, children: {} };
      });
  
      Promise.all(promises).then(() => {
        // Initialize allFolders Map
        allFolders = new Map();
        initializeFolderMap(folderStructure, '');
  
        updateFolderGallery();
        updateFileGallery();
      });
    }
  }

  function initializeFolderMap(folder, path) {
    const fullPath = path ? `${path}/${folder.name}` : folder.name;
    allFolders.set(fullPath, folder.isSelected);

    Object.values(folder.children).forEach((child) => {
      initializeFolderMap(child, fullPath);
    });
  }

  function updateFolderGallery() {
    let folderGallery = document.getElementById("folderGallery");
    folderGallery.innerHTML = "";

    function renderFolder(folder, path = "") {
      let div = document.createElement("div");
      div.className = "folder-item";

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = folder.isSelected;
      checkbox.addEventListener("change", () => toggleFolder(folder, path));

      let label = document.createElement("label");
      label.textContent = folder.name;

      div.appendChild(checkbox);
      div.appendChild(label);

      if (Object.keys(folder.children).length > 0) {
        let childrenContainer = document.createElement("div");
        childrenContainer.className = "folder-children";
        Object.entries(folder.children).forEach(([childName, childFolder]) => {
          childrenContainer.appendChild(
            renderFolder(childFolder, path ? `${path}/${childName}` : childName)
          );
        });
        div.appendChild(childrenContainer);
      }

      return div;
    }

    Object.values(folderStructure.children).forEach((folder) => {
      folderGallery.appendChild(renderFolder(folder, folder.name));
    });
  }

  function toggleFolder(folder, path) {
    folder.isSelected = !folder.isSelected;
    allFolders.set(path, folder.isSelected);

    function toggleSubfolders(f, p) {
      Object.entries(f.children).forEach(([childName, child]) => {
        child.isSelected = f.isSelected;
        const childPath = p ? `${p}/${childName}` : childName;
        allFolders.set(childPath, child.isSelected);
        toggleSubfolders(child, childPath);
      });
    }
    toggleSubfolders(folder, path);

    updateFolderGallery();
    updateFileGallery();
  }

  let sortDirection = {
    sortBy: null, // Keeps track of which column is currently sorted
    direction: null, // true for ascending, false for descending
  };

  function sortFiles(files, sortBy, direction) {
    return files.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.webkitRelativePath.toLowerCase();
        const nameB = b.webkitRelativePath.toLowerCase();
        if (nameA < nameB) return direction ? -1 : 1;
        if (nameA > nameB) return direction ? 1 : -1;
        return 0;
      } else if (sortBy === "size") {
        return direction ? a.size - b.size : b.size - a.size;
      } else if (sortBy === "tokenCount") {
        return direction ? a.tokenCount - b.tokenCount : b.tokenCount - a.tokenCount;
      }
    });
  }

  async function updateFileGallery() {
    let gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; 
  
    // create table
    let table = document.createElement("table");
    table.className = "file-table";
    table.cellSpacing = 0;
  
    // table header
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");
  
    let nameHeader = document.createElement("th");
    nameHeader.textContent = "File Name";
    nameHeader.className = "file-header";
    nameHeader.style.cursor = "pointer";
    nameHeader.addEventListener("click", () => handleSort("name"));
    headerRow.appendChild(nameHeader);
  
    let sizeHeader = document.createElement("th");
    sizeHeader.textContent = "Size";
    sizeHeader.className = "file-header";
    sizeHeader.style.cursor = "pointer";
    sizeHeader.addEventListener("click", () => handleSort("size"));
    headerRow.appendChild(sizeHeader);
  
    let tokenCountHeader = document.createElement("th");
    tokenCountHeader.textContent = "Tokens";
    tokenCountHeader.className = "file-header";
    tokenCountHeader.style.cursor = "pointer";
    tokenCountHeader.addEventListener("click", () => handleSort("tokenCount"));
    headerRow.appendChild(tokenCountHeader);
  
    let actionHeader = document.createElement("th");
    actionHeader.textContent = "";
    headerRow.appendChild(actionHeader);
  
    thead.appendChild(headerRow);
    table.appendChild(thead);
  
    // table body
    let tbody = document.createElement("tbody");

    let displayedFiles = uploadedFiles.filter(file => {
        if (file.webkitRelativePath) {
            const pathParts = file.webkitRelativePath.split('/');
            const folderPath = pathParts.slice(0, -1).join('/');
            return allFolders.get(folderPath) !== false;
        } else {
            return allFolders.get('Dropped Files') !== false;
        }
    });

    displayedFiles = sortFiles(displayedFiles, sortDirection.sortBy, sortDirection.direction);

    let totalTokens = 0;

    // Process each file and calculate token counts
    for (let file of displayedFiles) {
        if (!file.tokenCount) {
            file.tokenCount = await getTokenCount(file); // Calculate token count if not already calculated
        }
        totalTokens += parseInt(file.tokenCount, 10);

        let row = document.createElement("tr");
        row.className = "file-row";
  
        let nameCell = document.createElement("td");
        nameCell.className = "file-name";
  
        if (file.webkitRelativePath) {
            const pathParts = file.webkitRelativePath.split('/');
            const parentFolderAndFileName = pathParts.slice(-2).join('/');
            nameCell.textContent = parentFolderAndFileName;
            nameCell.title = file.webkitRelativePath;
        } else {
            nameCell.textContent = file.name;
            nameCell.title = file.name;
        }
  
        row.appendChild(nameCell);
  
        let sizeCell = document.createElement("td");
        sizeCell.className = "file-size";
        sizeCell.textContent = formatFileSize(file.size);
        row.appendChild(sizeCell);
  
        let tokenCountCell = document.createElement("td");
        tokenCountCell.className = "file-token-count";
        tokenCountCell.textContent = file.tokenCount.toLocaleString();
        row.appendChild(tokenCountCell);
  
        // create remove icon cell
        let actionCell = document.createElement("td");
        let removeIcon = document.createElement("span");
        removeIcon.textContent = "🚫";
        removeIcon.className = "remove-icon";
        removeIcon.addEventListener("click", function () {
            removeFile(file);
        });
        actionCell.appendChild(removeIcon);
        row.appendChild(actionCell);
  
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    gallery.appendChild(table);

    document.getElementById("fileCount").textContent = `${displayedFiles.length} files selected (${totalTokens.toLocaleString()} tokens total)`;
}

  

  function handleSort(column) {
    if (sortDirection.sortBy === column) {
      // Toggle direction if already sorting by this column
      sortDirection.direction = !sortDirection.direction;
    } else {
      // Otherwise, sort by this column in ascending order
      sortDirection.sortBy = column;
      sortDirection.direction = true;
    }
    updateFileGallery();
  }

  function removeFile(file) {
    const index = uploadedFiles.indexOf(file);
    if (index > -1) {
      uploadedFiles.splice(index, 1);
    }

    // Check if this was the last file in its folder
    const pathParts = file.webkitRelativePath.split("/");
    let currentLevel = folderStructure;

    // Traverse down the folder structure to the file's directory
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentLevel = currentLevel.children[pathParts[i]];
    }

    // Remove the file
    if (pathParts.length === 2) {
      // This is a top-level file
      const rootFiles = uploadedFiles.filter(
        (f) => f.webkitRelativePath.split("/").length === 2
      );
      if (rootFiles.length === 0) {
        delete folderStructure.children[pathParts[0]];
      }
    } else {
      const filesInSameFolder = uploadedFiles.some((f) =>
        f.webkitRelativePath.startsWith(pathParts.slice(0, -1).join("/"))
      );
      if (!filesInSameFolder) {
        delete currentLevel.children[pathParts[pathParts.length - 2]];
      }
    }

    updateFolderGallery();
    updateFileGallery();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + "b";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + "KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + "MB";
    else return (bytes / 1073741824).toFixed(1) + "GB";
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

  //   function handleDrop(e) {
  //     let dt = e.dataTransfer;
  //     let files = dt.files;
  //     handleFiles({ target: { files: files } });
  //   }

  function displayFileTree(fileTree) {
    console.log("Displaying file tree:", fileTree);
    let treeContainer = document.getElementById("fileTree");
    if (!treeContainer) {
      console.error("File tree container not found");
      return;
    }
    if (fileTree && fileTree.trim() !== "") {
      treeContainer.innerHTML = "<pre>" + fileTree + "</pre>";
      treeContainer.style.display = "block";
    } else {
      console.warn("File tree is empty");
      treeContainer.style.display = "none";
    }
  }

  uploadButton.addEventListener("click", function () {
    console.log("Upload button clicked");
    console.log("Number of uploaded files:", uploadedFiles.length);

    const selectedFiles = uploadedFiles.filter((file) => {
      const pathParts = file.webkitRelativePath.split("/");
      const folderPath = pathParts.slice(0, -1).join("/");
      const isSelected = allFolders.get(folderPath) !== false;
      console.log(
        "File:",
        file.name,
        "Path:",
        folderPath,
        "Selected:",
        isSelected
      );
      return isSelected;
    });

    console.log("Number of selected files:", selectedFiles.length);

    if (selectedFiles.length === 0) {
      updateStatus("No files selected");
      return;
    }

    let formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files[]", file);
      console.log("Appending file to form data:", file.name);
    });
    formData.append("folder_name", originalFolderName);

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
          console.error("File tree data is missing from the response");
          document.getElementById("fileTree").style.display = "none";
        }
        if (data.preview_content) {
          displayPreview(data.preview_content, data.repo_name);
        } else {
          console.error("Preview content is missing from the response");
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
    const previewElement = document.getElementById("preview");
    if (previewElement) {
      const fileContentElement = document.createElement("div");
      fileContentElement.className = "file-content";

      const sections = content.split("\n# ");

      sections.forEach((section, index) => {
        if (index === 0) {
          const repoNameElement = document.createElement("h2");
          repoNameElement.textContent = section.trim();
          fileContentElement.appendChild(repoNameElement);
        } else if (section.startsWith("File Tree")) {
          const fileTreeElement = document.createElement("div");
          fileTreeElement.className = "file-tree";
          const pre = document.createElement("pre");
          const code = document.createElement("code");
          code.className = "language-plaintext";
          code.textContent = section.split("```\n")[1].split("\n```")[0].trim();
          pre.appendChild(code);
          fileTreeElement.appendChild(pre);
          fileContentElement.appendChild(fileTreeElement);
        } else {
          const sectionElement = document.createElement("div");
          sectionElement.className = "file-section";
          const lines = section.split("\n");
          const header = lines.shift();
          const headerElement = document.createElement("h3");
          headerElement.className = "file-header-preview";
          headerElement.textContent = header.trim();
          sectionElement.appendChild(headerElement);

          const contentElement = document.createElement("div");
          contentElement.className = "file-content";

          if (header.trim().toLowerCase().endsWith(".md")) {
            const markdownContent = lines
              .join("\n")
              .match(/<markdown>([\s\S]*?)<\/markdown>/)[1];
            const unescapedContent = markdownContent.replace(/^\\#/gm, "#");
            contentElement.innerHTML = marked.parse(unescapedContent);
          } else {
            const bodyElement = document.createElement("pre");
            bodyElement.className = "file-body";
            const codeElement = document.createElement("code");

            const match = lines.join("\n").match(/```(\w+)?\n([\s\S]*?)\n```/);
            if (match) {
              let language = match[1] || "plaintext";
              const codeContent = match[2];

              codeElement.className = `language-${language}`;
              codeElement.textContent = codeContent.trim();
            } else {
              codeElement.className = "language-plaintext";
              codeElement.textContent = lines.join("\n").trim();
            }

            bodyElement.appendChild(codeElement);
            contentElement.appendChild(bodyElement);
          }

          sectionElement.appendChild(contentElement);
          fileContentElement.appendChild(sectionElement);
        }
      });

      previewElement.innerHTML = "";
      previewElement.appendChild(fileContentElement);

      if (typeof hljs !== "undefined") {
        document.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightElement(block);
        });
      } else {
        console.warn(
          "highlight.js is not loaded. Syntax highlighting may not work."
        );
      }
    } else {
      console.error("Preview element not found");
    }
  }

  downloadButton.addEventListener("click", function () {
    window.location.href = `/download/${downloadFilename}`;
  });
});
