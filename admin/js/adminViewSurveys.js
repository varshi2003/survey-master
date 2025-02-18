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


function removeOldCSSAndJS() {
  document.querySelectorAll("link[id^='admin-'], script[id^='admin-']").forEach((elem) => elem.remove());
  document.body.className = ""; 
}


function loadCSS(href, id) {
  if (!document.getElementById(id)) {
    htmlBuilder(
      [
        {
          tag: "link",
          attributes: { id, rel: "stylesheet", href: href },
        },
      ],
      document.head
    );
  }
}

function loadScript(src, id, callback) {
  if (!document.getElementById(id)) {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.onload = callback;
    document.body.appendChild(script);
  } else if (callback) {
    callback();
  }
}

window.renderAdminViewSurveys = function () {
  removeOldCSSAndJS();
  loadCSS("admin/css/adminViewSurveys.css", "admin-view-surveys-css");

  document.body.innerHTML = "";

  htmlBuilder(
    [
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


window.pageSize = window.pageSize || 3;
window.currentPage = window.currentPage || 0;

function viewSurveys(page = 0) {
  window.currentPage = page;

  fetch(
    `${window.CONFIG.HOST_URL}/api/surveys/surveyList?page=${window.currentPage}&size=${window.pageSize}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const surveyContainer = document.getElementById("survey-container");
      if (!surveyContainer) return;

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
                  click: () => {
                    Swal.fire({
                      title: "Survey Options",
                      text: "Choose an action:",
                      icon: "question",
                     showCancelButton: true,
                      confirmButtonText: "View Survey",
                      cancelButtonText: "Delete Survey",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        window.location.hash = `#/adminViewForm?id=${survey.id}`;
                      } else if (result.dismiss === Swal.DismissReason.cancel) {
                        deleteSurvey(survey.id);
                      }
                    });
                  },
                },
              },
            ],
            surveyContainer
          );
        });
      }
      updatePagination(data);
    });
}

function updatePagination(data) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;
  pagination.innerHTML = "";

  if (data.totalPages > 1) {
    const paginationElements = [];

    if (window.currentPage > 0) {
      paginationElements.push({
        tag: "button",
        class: "pagination-button",
        text: "Prev",
        events: {
          click: () => {
            window.currentPage--;
            viewSurveys(window.currentPage);
          },
        },
      });
    }

    paginationElements.push({
      tag: "span",
      class: "page-info",
      text: `Page ${window.currentPage + 1} of ${data.totalPages}`,
    });

    if (window.currentPage < data.totalPages - 1) {
      paginationElements.push({
        tag: "button",
        class: "pagination-button",
        text: "Next",
        events: {
          click: () => {
            window.currentPage++;
            viewSurveys(window.currentPage);
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
  removeOldCSSAndJS();

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
  loadScript("admin/js/adminViewForm.js", "admin-view-form-js", () => {
    if (typeof getSurvey === "function") {
      getSurvey(surveyId);
    }
  });
}

window.addEventListener("hashchange", routeHandler);
window.addEventListener("load", routeHandler);
window.addEventListener("popstate", routeHandler);

window.addEventListener("popstate", () => {
  removeOldCSSAndJS();

  if (window.location.pathname === "/adminDashboard") {
    loadCSS("admin/css/adminDashboard.css", "admin-dashboard-css");
    loadScript("admin/js/adminDashboard.js", "admin-dashboard-js", () => {
      if (typeof renderAdminDashboard === "function") {
        renderAdminDashboard();
      }
    });
  } else {
    routeHandler();
  }
});
function deleteSurvey(surveyId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${window.CONFIG.HOST_URL}/api/surveys/${surveyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            Swal.fire("Deleted!", "Survey has been deleted.", "success");
            viewSurveys(window.currentPage);
          } else {
            Swal.fire("Error!", "Failed to delete survey.", "error");
          }
        })
        .catch(() => {
          Swal.fire("Error!", "Something went wrong.", "error");
        });
    }
  });
}
