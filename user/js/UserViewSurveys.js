function htmlBuilder(elements, parent) {
  const listOfElements = [];
  const fragment = document.createDocumentFragment();

  elements.forEach((element) => {
    const tagObject = document.createElement(element.tag);
    const entries = Object.entries(element);

    entries.forEach(([key, value]) => {
      switch (key) {
        case "class":
          tagObject.className = value;
          break;
        case "text":
          tagObject.innerHTML = value;
          break;
        case "style":
          Object.entries(value).forEach(([styleKey, styleValue]) => {
            tagObject.style[styleKey] = styleValue;
          });
          break;
        case "attributes":
          Object.entries(value).forEach(([attrKey, attrValue]) => {
            tagObject.setAttribute(attrKey, attrValue);
          });
          break;
        case "colspan":
          tagObject.colSpan = value;
          break;
        case "children":
          htmlBuilder(value, tagObject);
          break;
      }
    });

    if (parent === undefined) {
      listOfElements.push(tagObject);
    } else {
      fragment.appendChild(tagObject);
    }
  });

  if (parent !== undefined) {
    parent.appendChild(fragment);
  }

  return listOfElements;
}

const domJson = [
  {
    tag: "div",
    class: "view-surveys-header",
    children: [
      {
        tag: "h1",
        text: "User Dashboard",
      },
    ],
  },
  {
    tag: "div",
    attributes: { id: "survey-container", class: "admin-survey-container" },
  },
  {
    tag: "div",
    attributes: { id: "pagination", class: "pagination" },
  },
];

function loadCustomCSS() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href.includes("home.css")) {
      link.remove();
    }
  });
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "user/css/UserViewSurveys.css";
  document.head.appendChild(link);
}

document.addEventListener("DOMContentLoaded", () => {
  loadCustomCSS();
  const elements = htmlBuilder(domJson);
  elements.forEach((el) => document.body.appendChild(el));
  viewSurveys();
});

let currentPage = 0;
const pageSize = 3;

function viewSurveys(page = 0) {
  console.log("ViewSurveys() called");
  fetch(
    `http://localhost:8080/api/surveys/surveyList?page=${page}&size=${pageSize}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (!data.content || !Array.isArray(data.content)) return;

      const surveyContainer = document.getElementById("survey-container");
      surveyContainer.innerHTML = "";
      surveyContainer.classList.add("survey-grid");

      data.content.forEach((survey) => {
        const surveyCard = {
          tag: "div",
          class: "card-user-view-surveys",
          children: [],
        };

        if (survey.imageUrl) {
          surveyCard.children.push({
            tag: "img",
            class: "survey-image",
            attributes: {
              src: survey.imageUrl,
              alt: survey.name,
            },
          });
        }

        surveyCard.children.push({
          tag: "h3",
          class: "survey-title",
          text: survey.name,
        });

        if (survey.description) {
          surveyCard.children.push({
            tag: "p",
            class: "survey-description",
            text: survey.description,
          });
        }

        surveyCard.attributes = {
          onclick: `navigateToSurvey('${survey.id}')`,
        };

        htmlBuilder([surveyCard], surveyContainer);
      });

      updatePagination(data);
    })

    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Something went wrong. Please try again later.",
        footer: `<p style="color:red;">Error Details: ${error.message}</p>`,
      });
    });
}

function updatePagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const paginationStructure = [];

  if (data.totalPages > 1) {
    if (currentPage > 0) {
      paginationStructure.push({
        tag: "button",
        text: "Previous",
        attributes: { onclick: "changePage(-1)" },
      });
    }

    paginationStructure.push({
      tag: "span",
      attributes: { class: "page-info" },
      text: `Page ${currentPage + 1} of ${data.totalPages}`,
    });

    if (currentPage < data.totalPages - 1) {
      paginationStructure.push({
        tag: "button",
        text: "Next",
        attributes: { onclick: "changePage(1)" },
      });
    }
  }

  htmlBuilder(paginationStructure, pagination);
}

function changePage(step) {
  currentPage += step;
  viewSurveys(currentPage);
}

function navigateToSurvey(surveyId) {
  window.history.pushState({}, "", `#/survey-form?id=${surveyId}`);
  routeHandler();
}

function routeHandler() {
  const hash = window.location.hash;
  if (hash.startsWith("#/survey-form")) {
    const params = new URLSearchParams(hash.split("?")[1]);
    const surveyId = params.get("id");
    if (surveyId) {
      import("./SurveyFormPage.js")
        .then(({ loadSurveyForm }) => {
          loadSurveyForm(surveyId);
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Failed to load SurveyFormPage.js!",
          });
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Missing Survey ID",
        text: "Survey ID is missing in the URL.",
      });
    }
  }
}

window.addEventListener("popstate", routeHandler);
