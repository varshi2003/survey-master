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
function loadViewSurveysCSS() {
  const existingLink = document.getElementById("dynamic-css");
  if (!existingLink) {
    const link = document.createElement("link");
    link.id = "dynamic-css";
    link.rel = "stylesheet";
    link.href = "admin/css/adminViewSurveys.css";
    document.head.appendChild(link);
  }
}
function loadCSS(href) {
  document.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
    if (
      link.href.includes("user/css") ||
      link.href.includes("admin/css") ||
      link.href.includes("home.css")
    ) {
      link.remove();
    }
  });

  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
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
  let existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript) {
    if (callback) callback(); // If script is already loaded, execute callback without reloading
    return;
  }

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
      loadCSS("admin/css/adminDashboard.css");
      if (typeof window.renderAdminDashboard === "function") {
        window.renderAdminDashboard();
      }
    });
  } else if (path === "/adminViewSurveys") {
    loadJS("admin/js/adminViewSurveys.js", () => {
      loadCSS("admin/css/adminViewSurveys.css");
      if (typeof window.renderAdminViewSurveys === "function") {
        window.renderAdminViewSurveys();
      }
    });
  } else if (path === "/surveyResponseDashboard") {
    loadJS("admin/js/surveyResponseDashboard.js", () => {
      loadCSS("admin/css/surveyResponseDashboard.css");
      if (typeof window.renderSurveyResponseDashboard === "function") {
        window.renderSurveyResponseDashboard();
      }
    });
  } else {
    renderSurveyResponseDashboard();
  }
}

window.surveyStructure = window.surveyStructure || {
  tag: "div",
  attributes: { id: "survey-container" },
  children: [],
};

window.paginationStructure = window.paginationStructure || {
  tag: "div",
  attributes: { id: "pagination" },
  children: [],
};
if (typeof window.currentPage === "undefined") {
  window.currentPage = 0;
}

if (typeof window.pageSize === "undefined") {
  window.pageSize = 3;
}

function viewSurveys(page = 0) {
  fetch(
    `${window.CONFIG.HOST_URL}/api/surveys/surveyList?page=${page}&size=${pageSize}`,
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
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (data.totalPages > 1) {
    if (window.currentPage > 0) {
      const prevButton = document.createElement("button");
      prevButton.className = "pagination-response-button";
      prevButton.textContent = "Prev";
      prevButton.addEventListener("click", () => {
        window.currentPage--;
        viewSurveys(window.currentPage);
      });
      pagination.appendChild(prevButton);
    }

    const pageInfo = document.createElement("span");
    pageInfo.className = "page-info";
    pageInfo.textContent = `Page ${window.currentPage + 1} of ${
      data.totalPages
    }`;
    pagination.appendChild(pageInfo);

    if (window.currentPage < data.totalPages - 1) {
      const nextButton = document.createElement("button");
      nextButton.className = "pagination-response-button";
      nextButton.textContent = "Next";
      nextButton.addEventListener("click", () => {
        window.currentPage++;
        viewSurveys(window.currentPage);
      });
      pagination.appendChild(nextButton);
    }
  }
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
  routeHandler();
});
