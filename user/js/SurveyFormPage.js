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
  link.href = "user/css/SurveyFormPage.css";
  document.head.appendChild(link);
}

let surveyData = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const surveyId = params.get("id");

  if (window.location.pathname.startsWith("/survey-form") && surveyId) {
    loadSurveyForm(surveyId);
  }
});

export function loadSurveyForm(surveyId) {
  if (!surveyId) {
    Swal.fire({
      icon: "error",
      title: "Invalid Survey",
      text: "Survey ID is missing!",
      confirmButtonText: "OK",
    });
    return;
  }

  loadCustomCSS();
  loadSweetAlert();
  document.body.innerHTML = "";

  const header = document.createElement("div");
  header.className = "header";
  const title = document.createElement("h1");
  title.id = "survey-title";
  title.textContent = "Survey Form";
  header.appendChild(title);
  document.body.appendChild(header);

  const form = document.createElement("form");
  form.id = "survey-form";
  form.className = "container";

  document.body.appendChild(form);
  getSurvey(surveyId);

  setTimeout(() => {
    const surveyForm = document.getElementById("survey-form");
    if (surveyForm) {
      surveyForm.addEventListener("submit", function (e) {
        e.preventDefault();
        validateForm();
      });
    }
  }, 1000);
}

function getSurvey(surveyId) {
  if (!surveyId) {
    Swal.fire({
      icon: "error",
      title: "Invalid Survey",
      text: "Survey ID is missing in the URL!",
      confirmButtonText: "OK",
    });
    return;
  }
  fetch(`http://localhost:8080/api/surveys/${surveyId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      surveyData = data;
      document.getElementById("survey-title").textContent = data.name;
      const form = document.getElementById("survey-form");
      form.innerHTML = "";

      data.questions.forEach((question, index) => {
        const field = document.createElement("div");
        field.className = "form-field";

        const label = document.createElement("label");
        label.textContent = `${index + 1}. ` + question.question;
        field.appendChild(label);

        let inputElement;
        let errorText = document.createElement("span");
        errorText.className = "error-text";
        errorText.style.color = "red";
        errorText.style.display = "block";

        switch (question.type) {
          case "Paragraph":
            inputElement = document.createElement("textarea");
            inputElement.placeholder = question.placeholder;
            if (question.required) {
              inputElement.setAttribute("data-minlength", "5");
              inputElement.setAttribute("data-maxlength", "200");
            }
            break;
          case "MultipleChoice":
          case "RadioButton":
            const optionContainer = document.createElement("div");
            optionContainer.className = "option-container";
            optionContainer.setAttribute("data-required", question.required);
            question.additionalProperties.options.forEach((option, i) => {
              const optionLabel = document.createElement("label");
              const optionInput = document.createElement("input");
              optionInput.type =
                question.type === "MultipleChoice" ? "checkbox" : "radio";
              optionInput.name = `question-${index}`;
              optionInput.value = option;
              optionLabel.appendChild(optionInput);
              optionLabel.appendChild(document.createTextNode(option));
              optionContainer.appendChild(optionLabel);
            });
            field.appendChild(optionContainer);
            break;
          case "DropDown":
            inputElement = document.createElement("select");
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select...";
            inputElement.appendChild(defaultOption);
            question.additionalProperties.options.forEach((option) => {
              const optionElement = document.createElement("option");
              optionElement.value = option;
              optionElement.textContent = option;
              inputElement.appendChild(optionElement);
            });
            break;
          case "FileUpload":
            inputElement = document.createElement("input");
            inputElement.type = "file";
            break;
          case "DateAndTime":
            inputElement = document.createElement("input");
            inputElement.type = "datetime-local";
            break;
          case "Email":
            inputElement = document.createElement("input");
            inputElement.type = "text";
            inputElement.placeholder = question.placeholder;
            if (question.required)
              inputElement.setAttribute("data-email", "true");
            inputElement.addEventListener("input", function () {
              errorText.textContent = "";
            });
            break;
        }

        if (inputElement) {
          inputElement.name = `question-${index}`;
          if (question.required)
            inputElement.setAttribute("data-required", "true");
          field.appendChild(inputElement);
          field.appendChild(errorText);
        }

        form.appendChild(field);
      });

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.className = "submit-button";
      submitButton.textContent = "Submit";
      form.appendChild(submitButton);
    })
    .catch(() =>
      Swal.fire({
        icon: "error",
        title: "Survey failed to load",
        text: "Survey data not loaded",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      })
    );
}

function validateForm() {
  let valid = true;
  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    const errorText = input.nextElementSibling;
    if (errorText) errorText.textContent = "";
    if (input.dataset.required) {
      if (!input.value.trim()) {
        errorText.textContent = "This field is required.";
        valid = false;
      }
      if (
        input.tagName === "TEXTAREA" &&
        input.dataset.minlength &&
        input.dataset.maxlength
      ) {
        const minLength = parseInt(input.dataset.minlength);
        const maxLength = parseInt(input.dataset.maxlength);
        if (input.value.length < minLength || input.value.length > maxLength) {
          errorText.textContent = `Paragraph must be between ${minLength} and ${maxLength} characters.`;
          valid = false;
        }
      }
      if (input.dataset.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value.trim())) {
          errorText.textContent = "Please enter a valid email address.";
          valid = false;
        }
      }
    }
  });

  document.querySelectorAll(".option-container").forEach((container) => {
    const required = container.getAttribute("data-required") === "true";
    if (!required) return;
    const options = container.querySelectorAll(
      "input[type=checkbox], input[type=radio]"
    );
    const errorText = document.createElement("span");
    errorText.className = "error-text";
    errorText.style.color = "red";
    errorText.style.display = "block";
    container.appendChild(errorText);

    if ([...options].some((option) => option.checked) === false) {
      errorText.textContent = "Please select at least one option.";
      valid = false;
    }
  });

  if (!valid) {
    Swal.fire({
      icon: "warning",
      title: "Validation Error",
      text: "Please correct the errors in the form.",
      confirmButtonText: "OK",
    });
    return;
  }
  submitSurvey();
}
function submitSurvey() {
  const responses = [];
  const formElements = document.getElementById("survey-form").elements;

  surveyData.questions.forEach((question, index) => {
    const response = {
      questionId: `question-${index}`,
      questionType: question.type,
      question: question.question,
      answer: "",
      required: question.required,
    };
    const element =
      formElements[`question-${index}`] ||
      formElements[`${question.type.toLowerCase()}-${index}`];

    if (element) {
      switch (question.type) {
        case "Paragraph":
        case "DropDown":
        case "DateAndTime":
        case "Email":
          response.answer = element.value;
          break;
        case "MultipleChoice":
          response.answer = [];
          document
            .querySelectorAll(`input[name="multipleChoice-${index}"]:checked`)
            .forEach((checkbox) => {
              response.answer.push(checkbox.value);
            });
          break;
        case "RadioButton":
          response.answer =
            document.querySelector(`input[name="radio-${index}"]:checked`)
              ?.value || "";
          break;
        case "FileUpload":
          response.answer = element.files[0]?.name || "";
          break;
      }
      responses.push(response);
    }
  });

  fetch("http://localhost:8080/api/survey-responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surveyId: surveyData.id, responses }),
  })
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Survey Saved successfully!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    })
    .catch(() =>
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Error submitting survey response. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      })
    );
}
