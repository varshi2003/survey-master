function loadadminDashboardCSS() {
  const existingLink = document.getElementById("dynamic-css");
  if (!existingLink) {
    const link = document.createElement("link");
    link.id = "dynamic-css";
    link.rel = "stylesheet";
    link.href = "home.css";
    document.head.appendChild(link);
  }
}

function loadSweetAlert(callback) {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
  script.onload = callback;
  document.head.appendChild(script);
}
function loadCustomCSS() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href.includes("home.css")) {
      link.remove();
    }
  });
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "admin/css/adminCreateForm.css";
  document.head.appendChild(link);
}

function renderAdminCreateForm() {
  loadCustomCSS();
  loadSweetAlert();

  const app = document.createElement("div");
  app.id = "app";

  const title = document.createElement("h1");
  title.textContent = "Let's Create a New Survey!";
  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "Survey Title";
  app.appendChild(title);
  app.appendChild(descriptionLabel);
  

  const surveyNameInput = document.createElement("input");
  surveyNameInput.type = "text";
  surveyNameInput.id = "surveyName";
  surveyNameInput.classList.add("survey-input");
  surveyNameInput.placeholder = "Enter Survey Name";
  app.appendChild(surveyNameInput);

  surveyNameInput.addEventListener("keydown", (event) => {
    if (
      surveyNameInput.value.length >= 30 &&
      event.key !== "Backspace" &&
      event.key !== "Delete"
    ) {
      event.preventDefault();
      showAlert(
        "Character Limit Reached!",
        "You can enter a maximum of 30 characters in the survey title."
      );
    }
  });

  surveyNameInput.addEventListener("paste", (event) => {
    const pastedText = event.clipboardData.getData("text");
    if (surveyNameInput.value.length + pastedText.length > 30) {
      event.preventDefault();
      showAlert(
        "Character Limit Reached!",
        "You can enter a maximum of 30 characters in the survey title."
      );
    }
  });

  const questionForm = document.createElement("form");
  questionForm.id = "questionForm";
  app.appendChild(questionForm);

  const addQuestionBtn = document.createElement("button");
  addQuestionBtn.id = "addQuestionBtn";
  addQuestionBtn.textContent = "Add Question";
  addQuestionBtn.addEventListener("click", (event) => {
    event.preventDefault();
    addQuestion();
  });
  app.appendChild(addQuestionBtn);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  const saveSurveyButton = document.createElement("button");
  saveSurveyButton.textContent = "Save Survey";
  saveSurveyButton.classList.add("save-survey-btn");
  saveSurveyButton.addEventListener("click", saveSurvey);
  buttonContainer.appendChild(saveSurveyButton);

  const cancelSurveyButton = document.createElement("button");
  cancelSurveyButton.textContent = "Cancel Survey";
  cancelSurveyButton.classList.add("cancel-survey-btn");
  cancelSurveyButton.addEventListener("click", cancelSurvey);
  buttonContainer.appendChild(cancelSurveyButton);

  app.appendChild(buttonContainer);
  document.body.appendChild(app);

  let questions = [];

  function addQuestion() {
    const question = {
      type: "Paragraph",
      question: "",
      placeholder: "",
      required: false,
      additionalProperties: {
        options: [],
      },
    };
    questions.push(question);
    renderQuestions();
  }

  function renderQuestions() {
    const form = document.getElementById("questionForm");

    const existingDescription =
      document.getElementById("surveyDescription")?.value || "";
    const existingImageInput = document.getElementById("surveyImage");
    const existingImageFile = existingImageInput?.files[0] || null;

    form.innerHTML = "";

    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Survey Description:";
    form.appendChild(descriptionLabel);

    const descriptionInput = document.createElement("textarea");
    descriptionInput.id = "surveyDescription";
    descriptionInput.placeholder = "Enter survey description here...";
    descriptionInput.value = existingDescription;
    form.appendChild(descriptionInput);

    descriptionInput.addEventListener("keydown", (event) => {
      if (
        descriptionInput.value.length >= 60 &&
        event.key !== "Backspace" &&
        event.key !== "Delete"
      ) {
        event.preventDefault();
        showAlert(
          "Character Limit Reached!",
          "You can enter a maximum of 60 characters in the survey description."
        );
      }
    });

    descriptionInput.addEventListener("paste", (event) => {
      const pastedText = event.clipboardData.getData("text");
      if (descriptionInput.value.length + pastedText.length > 60) {
        event.preventDefault();
        showAlert(
          "Character Limit Reached!",
          "You can enter a maximum of 60 characters in the survey description."
        );
      }
    });

    const imageLabel = document.createElement("label");
    imageLabel.textContent = "Upload Image:";
    form.appendChild(imageLabel);

    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.id = "surveyImage";
    form.appendChild(imageInput);

    if (existingImageFile) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(existingImageFile);
      imageInput.files = dataTransfer.files;
    }

    questions.forEach((question, index) => {
      const div = document.createElement("div");
      div.classList.add("question-container");

      const labelType = document.createElement("label");
      labelType.textContent = "Question Type";
      div.appendChild(labelType);

      const select = document.createElement("select");
      select.addEventListener("change", (e) => {
        updateType(index, e.target.value);
        validateSurvey();
      });

      [
        "Paragraph",
        "MultipleChoice",
        "RadioButton",
        "DropDown",
        "FileUpload",
        "DateAndTime",
        "Email",
      ].forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type.replace(/([A-Z])/g, " $1").trim();
        if (question.type === type) option.selected = true;
        select.appendChild(option);
      });

      div.appendChild(select);

      const labelRequired = document.createElement("label");
      labelRequired.textContent = "Required:";
      div.appendChild(labelRequired);

      const requiredDiv = document.createElement("div");
      requiredDiv.classList.add("required-options");

      [true, false].forEach((value) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `required-${index}`;
        input.value = value;
        input.checked = question.required === value;
        input.addEventListener("change", () => {
          updateRequired(index, value);
          validateSurvey();
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(value ? " Yes" : " No"));
        requiredDiv.appendChild(label);
      });

      div.appendChild(requiredDiv);

      const labelQuestion = document.createElement("label");
      labelQuestion.textContent = `${index+1} . Question:`;
      div.appendChild(labelQuestion);

      const inputText = document.createElement("input");
      inputText.type = "text";
      inputText.placeholder = "Enter the Question";
      inputText.value = question.question;
      inputText.addEventListener("blur", (e) => {
        updateQuestion(index, e.target.value);
        validateSurvey();
      });

      div.appendChild(inputText);

      if (question.type === "Paragraph" || question.type === "Email") {
        const labelPlaceholder = document.createElement("label");
        labelPlaceholder.textContent = "Placeholder Text:";
        div.appendChild(labelPlaceholder);

        const inputPlaceholder = document.createElement("input");
        inputPlaceholder.type = "text";
        inputPlaceholder.placeholder = "Enter placeholder text";
        inputPlaceholder.value = question.placeholder || "";
        inputPlaceholder.addEventListener("blur", (e) => {
          updatePlaceholder(index, e.target.value);
          validateSurvey();
        });

        div.appendChild(inputPlaceholder);
      }

      div.appendChild(renderOptionsField(index, question));

      const editButton = document.createElement("button");
      editButton.classList.add("edit-btn");
      editButton.textContent = "Edit Question";
      editButton.addEventListener("click", () => editQuestion(index));
      div.appendChild(editButton);

      const removeButton = document.createElement("button");
      removeButton.classList.add("remove-btn");
      removeButton.textContent = "Remove Question";
      removeButton.addEventListener("click", () => removeQuestion(index));
      div.appendChild(removeButton);

      form.appendChild(div);
    });
  }

  function renderOptionsField(index, question) {
    const optionsContainer = document.createElement("div");
    optionsContainer.id = `options-container-${index}`;

    if (["MultipleChoice", "RadioButton", "DropDown"].includes(question.type)) {
      const label = document.createElement("label");
      label.textContent = "Options:";
      optionsContainer.appendChild(label);

      question.additionalProperties.options.forEach((option, optIndex) => {
        const optionItem = document.createElement("div");
        optionItem.classList.add("option-item");

        const input = document.createElement("input");
        input.type = "text";
        input.value = option;
        input.addEventListener("input", (e) =>
          updateOption(index, optIndex, e.target.value)
        );

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () =>
          removeOption(index, optIndex)
        );

        optionItem.appendChild(input);
        optionItem.appendChild(removeButton);
        optionsContainer.appendChild(optionItem);
      });

      const addOptionButton = document.createElement("button");
      addOptionButton.textContent = "Add Option";
      addOptionButton.classList.add("add-option-btn");
      addOptionButton.addEventListener("click", () => addOption(index));

      optionsContainer.appendChild(addOptionButton);
    }

    return optionsContainer;
  }

  function renderJSON(json, parent, preserveExisting = false) {
    if (!preserveExisting) {
      parent.innerHTML = "";
    }
    json.children.forEach((element) => {
      let existingElement = document.getElementById(element.attributes?.id);
      let el = existingElement || document.createElement(element.tag);
      if (element.attributes) {
        Object.entries(element.attributes).forEach(([key, value]) =>
          el.setAttribute(key, value)
        );
      }
      if (element.text) {
        el.textContent = element.text;
      }
      if (element.events && !existingElement) {
        Object.entries(element.events).forEach(([event, handler]) =>
          el.addEventListener(event, handler)
        );
      }
      if (element.children) {
        renderJSON({ children: element.children }, el, preserveExisting);
      }
      if (!existingElement) {
        parent.appendChild(el);
      }
    });
  }

  function updateType(index, value) {
    questions[index].type = value;
    if (["MultipleChoice", "RadioButton", "DropDown"].includes(value)) {
      questions[index].additionalProperties.options = [];
    } else {
      delete questions[index].additionalProperties.options;
    }
    renderQuestions();
  }

  function updateRequired(index, value) {
    questions[index].required = value;
  }

  function updateQuestion(index, value) {
    questions[index].question = value;
  }
  function updatePlaceholder(index, value) {
    questions[index].placeholder = value;
  }
  function addOption(index) {
    questions[index].additionalProperties.options.push("");
    renderQuestions();
  }

  function updateOption(questionIndex, optionIndex, value) {
    questions[questionIndex].additionalProperties.options[optionIndex] = value;
  }

  function removeOption(questionIndex, optionIndex) {
    questions[questionIndex].additionalProperties.options.splice(
      optionIndex,
      1
    );
    renderQuestions();
  }

  function editQuestion(index) {
    event?.preventDefault();

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "white";
    modal.style.padding = "25px";
    modal.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.3)";
    modal.style.borderRadius = "8px";
    modal.style.zIndex = "1000";
    modal.style.textAlign = "center";
    modal.style.width = "350px";

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    overlay.style.zIndex = "999";

    const label = document.createElement("label");
    label.textContent = "Edit your question:";
    label.style.display = "block";
    label.style.marginBottom = "10px";
    label.style.fontSize = "16px";
    label.style.fontWeight = "bold";

    const input = document.createElement("input");
    input.type = "text";
    input.value = questions[index].question;
    input.style.width = "90%";
    input.style.padding = "8px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "5px";
    input.style.marginBottom = "15px";
    input.style.fontSize = "14px";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.gap = "10px";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.style.backgroundColor = "#28a745";
    saveButton.style.color = "white";
    saveButton.style.border = "none";
    saveButton.style.padding = "8px 15px";
    saveButton.style.borderRadius = "5px";
    saveButton.style.cursor = "pointer";
    saveButton.type = "button";

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.backgroundColor = "#6c757d";
    cancelButton.style.color = "white";
    cancelButton.style.border = "none";
    cancelButton.style.padding = "8px 15px";
    cancelButton.style.borderRadius = "5px";
    cancelButton.style.cursor = "pointer";
    cancelButton.type = "button";

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);

    modal.appendChild(label);
    modal.appendChild(input);
    modal.appendChild(buttonContainer);

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    saveButton.addEventListener("click", (event) => {
      event.preventDefault();
      questions[index].question = input.value;
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
      renderQuestions();
    });

    cancelButton.addEventListener("click", (event) => {
      event.preventDefault();
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    });

    overlay.addEventListener("click", () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    });
  }

  function removeQuestion(index) {
    event?.preventDefault();

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "white";
    modal.style.padding = "25px";
    modal.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.3)";
    modal.style.borderRadius = "8px";
    modal.style.zIndex = "1000";
    modal.style.textAlign = "center";
    modal.style.width = "300px";

    
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    overlay.style.zIndex = "999";

    const message = document.createElement("p");
    message.textContent = "Are you sure you want to delete this question?";
    message.style.marginBottom = "15px";
    message.style.fontSize = "16px";
    message.style.fontWeight = "bold";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.gap = "10px";

    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Yes";
    confirmButton.style.backgroundColor = "#d9534f";
    confirmButton.style.color = "white";
    confirmButton.style.border = "none";
    confirmButton.style.padding = "8px 15px";
    confirmButton.style.borderRadius = "5px";
    confirmButton.style.cursor = "pointer";
    confirmButton.type = "button";

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.backgroundColor = "#6c757d";
    cancelButton.style.color = "white";
    cancelButton.style.border = "none";
    cancelButton.style.padding = "8px 15px";
    cancelButton.style.borderRadius = "5px";
    cancelButton.style.cursor = "pointer";
    cancelButton.type = "button";

    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);

    modal.appendChild(message);
    modal.appendChild(buttonContainer);

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    confirmButton.addEventListener("click", (event) => {
      event.preventDefault();
      questions.splice(index, 1);
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
      renderQuestions();
    });

    cancelButton.addEventListener("click", (event) => {
      event.preventDefault();
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    });

    overlay.addEventListener("click", () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    });
  }

  function saveSurvey() {
    if (!validateSurvey()) return;

    const surveyName = document.getElementById("surveyName").value.trim();
    const surveyDescriptionElement =
      document.getElementById("surveyDescription");
    const surveyDescription = surveyDescriptionElement
      ? surveyDescriptionElement.value.trim()
      : "";
    const surveyImageInput = document.getElementById("surveyImage");
    const surveyImage = surveyImageInput.files[0];

    let survey = {
      name: surveyName,
      description: surveyDescription,
      imageUrl: "",
      questions,
    };

    if (surveyImage) {
      const reader = new FileReader();
      reader.onload = function (e) {
        survey.imageUrl = e.target.result;

        sendSurveyToBackend(survey);
      };
      reader.readAsDataURL(surveyImage);
    } else {
      sendSurveyToBackend(survey);
    }
  }

  function sendSurveyToBackend(survey) {
    Swal.fire({
      title: "Saving Survey...",
      text: "Please wait while we save your survey.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    fetch(`${window.CONFIG.HOST_URL}/api/surveys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(survey),
    })
      .then((response) => response.json())
      .then((data) => {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Survey saved successfully.",
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: `Error saving survey: ${error.message}`,
        });
      });
  }

  function cancelSurvey() {
    if (typeof Swal === "undefined") {
      Swal.fire({
        title: "Sweet Alert",
        text: "SweetAlert 2 is not loaded",
        icon: "warning",
      });
      return;
    }
    loadSweetAlert(() => {
      Swal.fire({
        title: "Are you sure?",
        text: "You will lose all progress on this survey!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, discard it!",
        cancelButtonText: "No, keep it",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          document.getElementById("surveyName").value = "";
          questions = [];
          renderQuestions();
          Swal.fire("Discarded!", "Survey discarded successfully!", "success");
        }
      });
    });
  }

  function validateSurvey() {
    let isValid = true;
    const surveyName = document.getElementById("surveyName");
    if (!surveyName || surveyName.value.trim() === "") {
      Swal.fire("Survey name cannot be left blank.");
      isValid = false;
    }

    questions.forEach((question, index) => {
      if (question.question.trim() === "") {
        Swal.fire(`Question ${index + 1} cannot be left blank.`);
        isValid = false;
      }

      if (question.type === "Paragraph") {
        const length = question.question.trim().length;
        if (length < 10 || length > 200) {
          Swal.fire(
            `Paragraph question ${
              index + 1
            } must be between 10 and 200 characters.`
          );
          isValid = false;
        }
      }

      if (
        ["MultipleChoice", "RadioButton", "DropDown"].includes(question.type)
      ) {
        if (question.additionalProperties.options.length < 2) {
          Swal.fire(`Question ${index + 1} must have at least 2 options.`);
          isValid = false;
        }
      }
    });

    return isValid;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSweetAlert(() => {
    renderAdminCreateForm();
  });
});

window.addEventListener("popstate", (event) => {
  if (window.location.pathname === "/adminDashboard") {
    loadadminDashboardCSS();
    window.renderAdminDashboard();
  } else {
    routeHandler();
  }
});
