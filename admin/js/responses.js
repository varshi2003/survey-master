function loadCustomCSS() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href.includes("home.css")) {
      link.remove();
    }
  });

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "admin/css/responses.css";
  document.head.appendChild(link);
}

function navigateTo(page) {
  window.history.pushState({}, "", page);
  routeHandler();
}

window.renderSurveyResponses = function (surveyId) {
  loadCustomCSS();
  document.body.innerHTML = "";

  const container = document.createElement("div");
  container.className = "response-details-container";

  const heading = document.createElement("h1");
  heading.textContent = "Survey Responses";
  container.appendChild(heading);

  const responseContainer = document.createElement("div");
  responseContainer.id = "response-container";
  responseContainer.className = "response-details-card-container";
  container.appendChild(responseContainer);

  const backButton = document.createElement("a");
  backButton.textContent = "Back to Home";
  backButton.className = "back-btn";
  backButton.href = "/home";
  backButton.onclick = function (event) {
    event.preventDefault();
    navigateTo("/surveyResponseDashboard");
  };
  container.appendChild(backButton);

  document.body.appendChild(container);

  if (!surveyId) {
    const urlParams = new URLSearchParams(window.location.search);
    surveyId = urlParams.get("id");
  }

  fetch(
    `${window.CONFIG.HOST_URL}/api/survey-responses/form-names?surveyId=${surveyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        renderJSON(
          {
            children: [
              { tag: "p", text: "No responses found for this survey." },
            ],
          },
          document.getElementById("response-container")
        );
        return;
      }

      const filteredResponses = data.filter(
        (response) => response.surveyId === surveyId
      );

      responseStructure.children = [];

      if (filteredResponses.length === 0) {
        responseStructure.children.push({
          tag: "p",
          text: "No responses found for this survey.",
        });
      } else {
        filteredResponses.forEach((response) => {
          responseStructure.children.push({
            tag: "div",
            attributes: { class: "response-details-card" },
            children: [{ tag: "h3", text: response.name }],
            events: {
              click: () => {
                navigateTo(
                  `/responseDetails?id=${response.id}&surveyId=${surveyId}`
                );
              },
            },
          });
        });
      }

      renderJSON(
        responseStructure,
        document.getElementById("response-container")
      );
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error fetching survey responses! Please try again later.",
      });
    });
};

function routeHandler() {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get("id");

  const routes = {
    "/surveyResponseDashboard": () =>
      loadJS("admin/js/surveyResponseDashboard.js", () =>
        window.renderSurveyResponseDashboard?.()
      ),

    "/surveyResponses": () => {
      loadJS("admin/js/responses.js", () => {
        if (typeof window.renderSurveyResponses === "function") {
          window.renderSurveyResponses(surveyId);
        }
      });
    },

    "/responseDetails": () => {
      const surveyResponseId = urlParams.get("id");
      const surveyId = urlParams.get("surveyId");

      if (surveyResponseId && surveyId) {
        import("./responseDetails.js").then((module) => {
          module.loadResponseDetails(surveyResponseId, surveyId);
        });
      }
    },

    "/adminViewForm": () => {
      if (surveyId) {
        loadAdminViewForm(surveyId);
      }
    },

    "/adminViewSurveys": () => {
      renderAdminViewSurveys();
    },
  };

  if (routes[path]) {
    routes[path]();
  }
}

document.addEventListener("DOMContentLoaded", routeHandler);
window.addEventListener("popstate", routeHandler);

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

window.responseStructure = window.responseStructure || {
  tag: "div",
  attributes: { id: "response-container" },
  children: [],
};

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get("id");
  renderSurveyResponses(surveyId);
});

window.addEventListener("popstate", routeHandler);
