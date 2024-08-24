document.addEventListener("DOMContentLoaded", function () {
  let dropArea = document.getElementById("drop-area");
  let uploadButton = document.getElementById("uploadBtn");
  let downloadButton = document.getElementById("downloadBtn");
  let statusDiv = document.getElementById("status");
  let progressBar = document.getElementById("progress-bar");
  let progressBarContainer = document.getElementById("progress-bar-container");
  let fileInput = document.getElementById("fileElem");

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
  let uploadedFiles = [];
  let downloadFilename = "";

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

    // Check if the file is in an excluded directory
    for (let dir of directories) {
      if (excludedDirectories.includes(dir)) {
        return false;
      }
    }

    // Check if the file has an excluded extension
    return !excludedExtensions.includes(extension);
  }

  function handleFiles(e) {
    let files = e.target.files || e.dataTransfer.files;
    uploadedFiles = Array.from(files).filter(isAllowedFile);
    updateGallery();
  }

  function updateGallery() {
    let gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    uploadedFiles.forEach((file) => {
      let div = document.createElement("div");
      div.textContent = `${file.webkitRelativePath || file.name} (${formatFileSize(file.size)})`;
      gallery.appendChild(div);
    });
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

  uploadButton.addEventListener("click", function () {
    if (uploadedFiles.length === 0) {
      updateStatus("No files selected");
      return;
    }

    let formData = new FormData();
    uploadedFiles.forEach((file) => formData.append("files[]", file));

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
        updateStatus(data.message);
        downloadButton.style.display = "inline-block";
        progressBarContainer.style.display = "none";
        downloadFilename = data.filename;
      })
      .catch((error) => {
        console.error("Error:", error);
        updateStatus(
          "An error occurred during upload: " +
            (error.error || error.message || "Unknown error"),
        );
        progressBarContainer.style.display = "none";
      });
  });

  downloadButton.addEventListener("click", function () {
    window.location.href = `/download/${downloadFilename}`;
  });
});
