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

function loadCustomCSS() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href.includes("home.css")) {
      link.remove();
    }
  });

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "admin/css/surveyResponseDashboard.css";
  document.head.appendChild(link);
}

function getSurveyStructure() {
  return {
    tag: "div",
    attributes: { id: "survey-container" },
    children: [],
  };
}

function getPaginationStructure() {
  return {
    tag: "div",
    attributes: { id: "pagination" },
    children: [],
  };
}

function renderSurveyResponseDashboard() {
  loadCustomCSS();
  document.body.innerHTML = "";

  const header = document.createElement("div");
  header.className = "header";
  const title = document.createElement("h1");
  title.textContent = "Survey Forms";
  header.appendChild(title);
  document.body.appendChild(header);

  const container = document.createElement("div");
  container.id = "survey-container";
  container.className = "container";
  document.body.appendChild(container);

  const pagination = document.createElement("div");
  pagination.id = "pagination";
  pagination.className = "pagination";
  document.body.appendChild(pagination);

  if (window.location.pathname !== "/surveyResponseDashboard") {
    window.history.pushState({}, "", "/surveyResponseDashboard");
  }

  viewSurveys();
}

function loadJS(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  document.body.appendChild(script);
}

function routeHandler() {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get("id");

  document.body.innerHTML = "";

  if (path === "/surveyResponses" && surveyId) {
    loadJS("admin/js/responses.js", () => {
      if (typeof window.renderSurveyResponses === "function") {
        window.renderSurveyResponses(surveyId);
      }
    });
  } else if (path === "/adminDashboard") {
    loadJS("admin/js/adminDashboard.js", () => {
      if (typeof window.renderAdminDashboard === "function") {
        loadadminDashboardCSS();
        window.renderAdminDashboard();
      }
    });
  } else {
    renderSurveyResponseDashboard();
  }
}

const surveyStructure = {
  tag: "div",
  attributes: { id: "survey-container" },
  children: [],
};

const paginationStructure = {
  tag: "div",
  attributes: { id: "pagination" },
  children: [],
};

let currentPage = 0;
const pageSize = 6;

function viewSurveys(page = 0) {
  fetch(
    `http://localhost:8080/api/surveys/surveyList?page=${page}&size=${pageSize}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const surveys = data.content || [];
      if (!Array.isArray(surveys)) {
        return;
      }
      const surveyStructure = getSurveyStructure();
      surveyStructure.children = surveys.map((survey) => ({
        tag: "div",
        attributes: { class: "card", id: `survey-${survey.id}` },
        children: [
          { tag: "h3", text: survey.name },
          {
            tag: "div",
            attributes: { class: "response-container" },
            children: [
              {
                tag: "p",
                attributes: { class: "accept" },
                text: `Accepted: ${survey.acceptCount}`,
              },
              {
                tag: "p",
                attributes: { class: "reject" },
                text: `Rejected: ${survey.rejectCount}`,
              },
            ],
          },
        ],
      }));

      renderJSON(surveyStructure, document.getElementById("survey-container"));

      // Attach click event listeners after rendering
      surveys.forEach((survey) => {
        const surveyCard = document.getElementById(`survey-${survey.id}`);
        if (surveyCard) {
          surveyCard.addEventListener("click", () => {
            window.history.pushState(
              {},
              "",
              `/surveyResponses?id=${survey.id}`
            );
            routeHandler();
          });
        }
      });

      updatePagination(data);
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error Loading Surveys",
        text: `Failed to load surveys. Error: ${error.message}`,
      });
    });
}

function updatePagination(data) {
  const paginationStructure = getPaginationStructure();
  paginationStructure.children = [];

  if (data.totalPages > 1) {
    if (currentPage > 0) {
      paginationStructure.children.push({
        tag: "button",
        attributes: { class: "pagination-response-button" },
        text: "Prev",
        events: {
          click: () => {
            currentPage--;
            viewSurveys(currentPage);
          },
        },
      });
    }

    paginationStructure.children.push({
      tag: "span",
      attributes: { class: "page-info" },
      text: `Page ${currentPage + 1} of ${data.totalPages}`,
    });

    if (currentPage < data.totalPages - 1) {
      paginationStructure.children.push({
        tag: "button",
        attributes: { class: "pagination-response-button" },
        text: "Next",
        events: {
          click: () => {
            currentPage++;
            viewSurveys(currentPage);
          },
        },
      });
    }
  }

  renderJSON(paginationStructure, document.getElementById("pagination"));
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
window.addEventListener("popstate", (event) => {
  if (window.location.pathname === "/adminDashboard") {
    loadadminDashboardCSS();
    window.renderAdminDashboard();
  } else {
    routeHandler();
  }
});
