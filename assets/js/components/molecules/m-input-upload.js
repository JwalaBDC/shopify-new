class UploadInputMolecule {
  constructor(el) {
    this.inputContainer = el;
    this.inputElement = this.inputContainer.querySelector(".m-input-upload__upload");
    this.isRequired = this.inputElement.hasAttribute("required");
    this.errorElement = this.inputContainer.querySelector(".m-input-upload__error");
    this.removeButton = this.inputContainer.querySelector(".m-input-upload__button");
    this.fileAllow = this.inputElement.accept.split(",").map(type => type.trim());
    this.fileSizeLimit = (parseInt(this.inputElement.dataset.limit ?? "") ?? 10) * 1024 * 1024;
    if (this.inputElement) {
      this.addEventListeners();
    } else {
      console.error("Input element not found within the container:", this.inputContainer);
    }
  }
  get file() {
    return this.inputElement.files[0];
  }
  get isInvalidFile() {
    if (!this.file) return true;
    const fileMimeType = this.file.type;
    const fileExtension = this.file.name.split(".").pop();
    const isValidType = this.fileAllow.some(type => {
      if (type.endsWith("/*")) {
        const baseType = type.replace("/*", "");
        return fileMimeType.startsWith(baseType);
      }
      return this.fileAllow.includes(fileMimeType) || this.fileAllow.includes(`.${fileExtension}`);
    });
    return !isValidType;
  }
  get isInvalidSize() {
    if (!this.file) return true;
    const fileSize = this.file.size;
    return fileSize > this.fileSizeLimit;
  }
  get isInvalid() {
    return this.isInvalidFile || this.isInvalidSize;
  }
  handleFileTypeAndSize() {
    if (!this.file) {
      if (this.inputContainer.classList.contains("is-uploaded")) {
        setTimeout(() => {
          this.inputContainer.classList.remove("is-uploaded");
        }, 0);
      }
      return;
    }
    if (this.isInvalid) {
      this.inputContainer.classList.add("is-invalid");
      if (this.isInvalidFile) {
        this.errorElement.textContent = this.errorElement.dataset.format ?? "Invalid file type.";
      } else if (this.isInvalidSize) {
        this.errorElement.textContent = this.errorElement.dataset.max ?? "File size exceeds limit.";
      }
    } else {
      this.inputContainer.classList.remove("is-invalid");
      this.errorElement.textContent = "";
    }
  }
  addEventListeners() {
    this.inputElement.addEventListener("change", () => {
      //console.log("this.inputContainer", this.inputContainer);
      this.inputContainer.classList.add("is-uploading");
      this.handleFileTypeAndSize();
      if (!this.inputContainer.classList.contains("is-invalid")) {
        this.inputContainer.classList.add("is-uploaded");
      }
      this.inputContainer.classList.remove("is-uploading");
    });
    if (this.removeButton) {
      this.removeButton.addEventListener("click", () => {
        this.inputElement.value = "";
        this.inputContainer.classList.remove("is-uploading", "is-uploaded", "is-invalid");
        this.errorElement.textContent = "";
      });
    }
  }
}

// Initialize inputTextMolecule instances
const initializeFormUploadInput = () => {
  const uploadInputs = document.querySelectorAll(".m-input-upload");
  uploadInputs.forEach(el => {
    el.uploadInputMoleculeInstant = new UploadInputMolecule(el);
  });
};

// Call initializeFormUploadInput to initialize all instances
initializeFormUploadInput();