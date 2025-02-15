if (!window.pageStructure) {
  window.pageStructure = {
    tag: "div",
    attributes: { id: "form-container" },
    children: [
      {
        tag: "div",
        attributes: { class: "header" },
        children: [
          {
            tag: "h1",
            attributes: { id: "survey-title" },
            text: "Survey Form",
          },
        ],
      },
      {
        tag: "form",
        attributes: { id: "survey-form", class: "container" },
      },
    ],
  };
}

function addCSS() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href.includes("home.css")) {
      link.remove();
    }
  });

  if (!document.querySelector('link[href="admin/css/adminViewForm.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "admin/css/adminViewForm.css";
    document.head.appendChild(link);
  }
}

function renderPage() {
  document.body.innerHTML = "";
  renderJSON(window.pageStructure, document.body);
  addCSS();
}

renderPage();

setTimeout(() => {
  if (document.getElementById("survey-title")) {
    getSurvey();
  } else {
    Swal.fire({
      icon: "error",
      title: "Survey ID Missing",
      text: "Element with id 'survey-title' still not found after rendering.",
    });
  }
}, 100);

// function getSurvey(surveyId = null) {
//   if (!surveyId) {
//     const params = new URLSearchParams(window.location.hash.split("?")[1]);
//     surveyId = params.get("id");
//   }

//   if (!surveyId) {
//     Swal.fire({
//       icon: "error",
//       title: "Survey ID Missing",
//       text: "Survey ID not found in URL. Please check the link.",
//     });
//     return;
//   }

//   fetch(`http://localhost:8080/api/surveys/${surveyId}`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       if (!data || !data.questions) {
//         throw new Error("Invalid survey data format");
//       }

//       const surveyTitleElement = document.getElementById("survey-title");
//       if (surveyTitleElement) {
//         surveyTitleElement.textContent = data.name;
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Survey ID Missing",
//           text: "Element with id 'survey-title' not found.",
//         });
//       }

//       const form = document.getElementById("survey-form");
//       form.innerHTML = "";

//       const surveyStructure = {
//         tag: "div",
//         children: data.questions.map((question, index) => {
//           let inputElement;
//           let options = [];

//           switch (question.type) {
//             case "Paragraph":
//               inputElement = {
//                 tag: "textarea",
//                 attributes: {
//                   name: `question-${index}`,
//                   placeholder: question.placeholder,
//                 },
//               };
//               break;
//             case "MultipleChoice":
//               options = question.additionalProperties.options.map((option) => ({
//                 tag: "label",
//                 children: [
//                   {
//                     tag: "input",
//                     attributes: {
//                       type: "checkbox",
//                       name: `multipleChoice-${index}`,
//                       value: option,
//                     },
//                   },
//                   { tag: "span", text: option },
//                 ],
//               }));
//               break;
//             case "RadioButton":
//               options = question.additionalProperties.options.map((option) => ({
//                 tag: "label",
//                 children: [
//                   {
//                     tag: "input",
//                     attributes: {
//                       type: "radio",
//                       name: `radio-${index}`,
//                       value: option,
//                     },
//                   },
//                   { tag: "span", text: option },
//                 ],
//               }));
//               break;
//             case "DropDown":
//               inputElement = {
//                 tag: "select",
//                 attributes: { name: `dropdown-${index}` },
//                 children: [
//                   {
//                     tag: "option",
//                     attributes: { value: "" },
//                     text: "Select...",
//                   },
//                   ...question.additionalProperties.options.map((option) => ({
//                     tag: "option",
//                     attributes: { value: option },
//                     text: option,
//                   })),
//                 ],
//               };
//               break;
//             case "FileUpload":
//               inputElement = {
//                 tag: "input",
//                 attributes: { type: "file", name: `file-${index}` },
//               };
//               break;
//             case "DateAndTime":
//               inputElement = {
//                 tag: "input",
//                 attributes: {
//                   type: "datetime-local",
//                   name: `datetime-${index}`,
//                 },
//               };
//               break;
//             case "Email":
//               inputElement = {
//                 tag: "input",
//                 attributes: {
//                   type: "email",
//                   name: `email-${index}`,
//                   placeholder: question.placeholder,
//                 },
//               };
//               break;
//           }

//           return {
//             tag: "div",
//             attributes: { class: "form-field" },
//             children: [
//               { tag: "label", text: `${index + 1}. ${question.question}` },
//               ...(options.length ? options : [inputElement]),
//             ],
//           };
//         }),
//       };

//       renderJSON(surveyStructure, form, true);
//     })
//     .catch((error) => {
//       Swal.fire({
//         icon: "error",
//         title: "Error Updating Status!",
//         text: `Failed to update status. Error: ${error.message}`,
//       });
//     });
// }
function getSurvey(surveyId = null) {
  if (!surveyId) {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    surveyId = params.get("id");
  }

  if (!surveyId) {
    Swal.fire({
      icon: "error",
      title: "Survey ID Missing",
      text: "Survey ID not found in URL. Please check the link.",
    });
    return;
  }

  // Wait for the survey form to be available before modifying it
  const waitForElement = (selector, callback, timeout = 1000) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        callback(element);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        Swal.fire({
          icon: "error",
          title: "Error Fetching Survey",
          text: `Survey form container not found.`,
        });
      }
    }, 50);
  };

  fetch(`http://localhost:8080/api/surveys/${surveyId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.questions) {
        throw new Error("Invalid survey data format");
      }

      waitForElement("#survey-form", (form) => {
        form.innerHTML = ""; // Only update the form after it exists

        const surveyTitleElement = document.getElementById("survey-title");
        if (surveyTitleElement) {
          surveyTitleElement.textContent = data.name;
        }

        const surveyStructure = {
          tag: "div",
          children: data.questions.map((question, index) => {
            let inputElement;
            let options = [];

            switch (question.type) {
              case "Paragraph":
                inputElement = {
                  tag: "textarea",
                  attributes: {
                    name: `question-${index}`,
                    placeholder: question.placeholder,
                  },
                };
                break;
              case "MultipleChoice":
                options = question.additionalProperties.options.map((option) => ({
                  tag: "label",
                  children: [
                    {
                      tag: "input",
                      attributes: {
                        type: "checkbox",
                        name: `multipleChoice-${index}`,
                        value: option,
                      },
                    },
                    { tag: "span", text: option },
                  ],
                }));
                break;
              case "RadioButton":
                options = question.additionalProperties.options.map((option) => ({
                  tag: "label",
                  children: [
                    {
                      tag: "input",
                      attributes: {
                        type: "radio",
                        name: `radio-${index}`,
                        value: option,
                      },
                    },
                    { tag: "span", text: option },
                  ],
                }));
                break;
              case "DropDown":
                inputElement = {
                  tag: "select",
                  attributes: { name: `dropdown-${index}` },
                  children: [
                    {
                      tag: "option",
                      attributes: { value: "" },
                      text: "Select...",
                    },
                    ...question.additionalProperties.options.map((option) => ({
                      tag: "option",
                      attributes: { value: option },
                      text: option,
                    })),
                  ],
                };
                break;
              case "FileUpload":
                inputElement = {
                  tag: "input",
                  attributes: { type: "file", name: `file-${index}` },
                };
                break;
              case "DateAndTime":
                inputElement = {
                  tag: "input",
                  attributes: {
                    type: "datetime-local",
                    name: `datetime-${index}`,
                  },
                };
                break;
              case "Email":
                inputElement = {
                  tag: "input",
                  attributes: {
                    type: "email",
                    name: `email-${index}`,
                    placeholder: question.placeholder,
                  },
                };
                break;
            }

            return {
              tag: "div",
              attributes: { class: "form-field" },
              children: [
                { tag: "label", text: `${index + 1}. ${question.question}` },
                ...(options.length ? options : [inputElement]),
              ],
            };
          }),
        };

        renderJSON(surveyStructure, form, true);
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error Updating Status!",
        text: `Failed to update status. Error: ${error.message}`,
      });
    });
}

function renderJSON(structure, parentElement, clear = false) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const createElement = (node) => {
    if (!node || !node.tag) return document.createTextNode(node.text || "");

    const element = document.createElement(node.tag);

    if (node.attributes) {
      Object.entries(node.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    if (node.events) {
      Object.entries(node.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }

    if (node.children) {
      node.children.forEach((child) =>
        element.appendChild(createElement(child))
      );
    } else if (node.text) {
      element.textContent = node.text;
    }

    return element;
  };

  parentElement.appendChild(createElement(structure));
}

// window.onload = function () {
//   renderPage();
//   setTimeout(() => {
//     if (document.getElementById("survey-title")) {
//       getSurvey();
//     } else {
//       Swal.fire({
//         icon: "error",
//         title: "Error Fetching Surveys",
//         text: "Element with id 'survey-title' still not found after rendering.",
//       });
//     }
//   }, 100);
// };


window.onpopstate = function () {
  if (window.location.pathname.includes("adminViewSurveys")) {
    document.body.innerHTML = ""; 
    loadScript("admin/js/adminViewSurveys.js", () => {
      renderAdminViewSurveys();
    });
  }
};


function loadScript(scriptPath, callback) {
  if (document.querySelector(`script[src="${scriptPath}"]`)) {
    if (callback) callback();
    return;
  }

  const script = document.createElement("script");
  script.src = scriptPath;
  script.onload = callback;
  document.body.appendChild(script);
}
function routeHandler() {
  const hash = window.location.hash;

  if (hash.startsWith("#/adminViewForm")) {
    const params = new URLSearchParams(hash.split("?")[1]);
    const surveyId = params.get("id");

    if (surveyId) {
      document.body.innerHTML = ""; // Ensure body is cleared before loading script

      loadScript("admin/js/adminViewForm.js", () => {
        setTimeout(() => {
          if (typeof getSurvey === "function") {
            getSurvey(surveyId);
          } else {
            // Swal.fire({
            //   icon: "error",
            //   title: "Error Fetching Surveys",
            //   text: `Survey Id is not available`,
            // });
          }
        }, 300);
      });
    }
  } else if (hash.startsWith("#/adminViewSurveys")) {
    document.body.innerHTML = "";
    loadScript("admin/js/adminViewSurveys.js", () => {
      renderAdminViewSurveys();
    });
  }
}
