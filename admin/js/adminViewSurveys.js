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
          tagObject.textContent = value;
          break;
        case "style":
          Object.assign(tagObject.style, value);
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
        case "events":
          Object.entries(value).forEach(([event, handler]) => {
            tagObject.addEventListener(event, handler);
          });
          break;
      }
    });

    if (!parent) {
      listOfElements.push(tagObject);
    } else {
      fragment.appendChild(tagObject);
    }
  });

  if (parent) {
    parent.appendChild(fragment);
  }

  return listOfElements;
}

function loadAdminDashboardCSS() {
  if (!document.getElementById("dynamic-css")) {
    htmlBuilder(
      [
        {
          tag: "link",
          attributes: {
            id: "dynamic-css",
            rel: "stylesheet",
            href: "admin/css/adminDashboard.css",
          },
        },
      ],
      document.head
    );
  }
}

window.renderAdminViewSurveys = function () {
  document.body.innerHTML = "";

  htmlBuilder(
    [
      {
        tag: "link",
        attributes: {
          rel: "stylesheet",
          type: "text/css",
          href: "admin/css/adminViewSurveys.css",
        },
      },
      {
        tag: "div",
        class: "view-surveys-header",
        children: [{ tag: "h1", text: "Survey Forms" }],
      },
      { tag: "div", attributes: { id: "form-builder" } },
      {
        tag: "div",
        attributes: { id: "survey-container" },
        class: "admin-survey-container",
      },
      { tag: "div", attributes: { id: "pagination" } },
      {
        tag: "script",
        attributes: { src: "https://cdn.jsdelivr.net/npm/sweetalert2@11" },
      },
    ],
    document.body
  );

  viewSurveys();
};

let currentPage = 0;
const pageSize = 3;

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
      const surveyContainer = document.getElementById("survey-container");
      surveyContainer.innerHTML = data?.content?.length
        ? ""
        : "<p>No surveys available.</p>";

      if (data?.content?.length) {
        surveyContainer.classList.add("survey-grid");
        data.content.forEach((survey) => {
          htmlBuilder(
            [
              {
                tag: "div",
                class: "card-admin-view-surveys",
                children: [
                  survey.imageUrl
                    ? {
                        tag: "img",
                        attributes: { src: survey.imageUrl, alt: survey.name },
                        class: "survey-image",
                      }
                    : null,
                  { tag: "h3", class: "survey-title", text: survey.name },
                  {
                    tag: "p",
                    class: "survey-description",
                    text: survey.description,
                  },
                ].filter(Boolean),
                events: {
                  click: () =>
                    (window.location.hash = `#/adminViewForm?id=${survey.id}`),
                },
              },
            ],
            surveyContainer
          );
        });
      }
      updatePagination(data);
    })
    .catch((error) => console.error("Error fetching surveys:", error));
}

function updatePagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  if (data.totalPages > 1) {
    const paginationElements = [];

    if (currentPage > 0) {
      paginationElements.push({
        tag: "button",
        class: "pagination-button",
        text: "Prev",
        events: {
          click: () => {
            currentPage--;
            viewSurveys(currentPage);
          },
        },
      });
    }

    paginationElements.push({
      tag: "span",
      class: "page-info",
      text: `Page ${currentPage + 1} of ${data.totalPages}`,
    });

    if (currentPage < data.totalPages - 1) {
      paginationElements.push({
        tag: "button",
        class: "pagination-button",
        text: "Next",
        events: {
          click: () => {
            currentPage++;
            viewSurveys(currentPage);
          },
        },
      });
    }

    htmlBuilder(
      [
        {
          tag: "div",
          class: "pagination-wrapper",
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
          },
          children: paginationElements,
        },
      ],
      pagination
    );
  }
}

function routeHandler() {
  const hash = window.location.hash;
  if (hash.startsWith("#/adminViewForm")) {
    const params = new URLSearchParams(hash.split("?")[1]);
    const surveyId = params.get("id");
    if (surveyId) loadAdminViewForm(surveyId);
  } else if (hash.startsWith("#/adminViewSurveys")) {
    renderAdminViewSurveys();
  }
}

function loadAdminViewForm(surveyId) {
  document.body.innerHTML = "";
  if (!window.adminViewFormLoaded) {
    htmlBuilder(
      [
        {
          tag: "script",
          attributes: { src: "admin/js/adminViewForm.js" },
          events: {
            load: () => {
              window.adminViewFormLoaded = true;
              setTimeout(() => getSurvey?.(surveyId) ?? 300);
            },
          },
        },
      ],
      document.body
    );
  } else {
    setTimeout(() => getSurvey(surveyId), 200);
  }
}

window.addEventListener("hashchange", routeHandler);
window.addEventListener("load", routeHandler);
routeHandler();

window.addEventListener("popstate", () => {
  if (window.location.pathname === "/adminDashboard") {
    loadAdminDashboardCSS();
    window.renderAdminDashboard();
  } else {
    routeHandler();
  }
});
