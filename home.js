const store = (() => {
  let state = {};
  let listeners = {};

  return {
    getState: (key) => (key ? state[key] : { ...state }),

    setState: (key, value) => {
      state[key] = value;
      if (listeners[key]) {
        listeners[key].forEach((callback) => callback(value));
      }
    },

    removeState: (key) => {
      delete state[key];
      if (listeners[key]) {
        listeners[key].forEach((callback) => callback(undefined));
      }
    },

    subscribe: (key, callback) => {
      if (!listeners[key]) {
        listeners[key] = [];
      }
      listeners[key].push(callback);
    },

    unsubscribe: (key, callback) => {
      if (listeners[key]) {
        listeners[key] = listeners[key].filter((cb) => cb !== callback);
      }
    },
  };
})();

function handleRoleChange(newRole) {
  if (newRole === "Admin") {
    store.unsubscribe("userRole", handleRoleChange);
    navigateTo("/adminDashboard");
  } else {
    store.subscribe("userRole", handleRoleChange);
    navigateTo("/UserViewSurveys");
  }
}

store.subscribe("userRole", handleRoleChange);

export function htmlBuilder(elements, parent) {
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

document.addEventListener("DOMContentLoaded", () => {
  loadCSS("home.css");
  routeHandler();
});

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

function loadJS(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  script.onerror = () => showError("Failed to load script");
  document.body.appendChild(script);
}

function showError(message) {
  Swal.fire({ icon: "error", title: "Oops...", text: message });
}

function createHomePage() {
  document.body.innerHTML = "";
  const domJson = [
    {
      tag: "div",
      class: "container-home",
      children: [
        {
          tag: "div",
          class: "card-home",
          attributes: { id: "adminCard" },
          children: [
            {
              tag: "img",
              attributes: {
                class : "card-image",
                src: "images/admin-image.avif",
                alt: "Admin Icon",
              },
            },
            { tag: "h3", text: "Admin" },
          ],
        },
        {
          tag: "div",
          class: "card-home",
          attributes: { id: "userCard" },
          children: [
            {
              tag: "img",
              attributes: {
                class : "card-image",
                src: "images/user-image.png",
                alt: "User Icon",
              },
            },
            { tag: "h3", text: "User" },
          ],
        },
      ],
    },
  ];

  htmlBuilder(domJson, document.body);

  document
    .getElementById("adminCard")
    .addEventListener("click", () => navigateTo("/adminDashboard"));
  document
    .getElementById("userCard")
    .addEventListener("click", () => navigateTo("/UserViewSurveys"));
}

function navigateTo(path, params = {}) {
  const url = new URL(window.location.origin + path);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  window.history.pushState({}, "", url.toString());
  routeHandler();
}

const routes = {
  "/UserViewSurveys": {
    script: "user/js/UserViewSurveys.js",
    callback: renderUserViewSurveys,
  },
  "/adminDashboard": {
    script: "admin/js/adminDashboard.js",
    callback: () => {
      if (typeof window.renderAdminDashboard === "function") {
        window.renderAdminDashboard();
      } else {
        showError("Admin dashboard function not found!");
      }
    },
  },
  "/survey-form": {
    script: "user/js/SurveyFormPage.js",
    callback: () => {
      const params = new URLSearchParams(window.location.search);
      const surveyId = params.get("id");
      if (surveyId && typeof renderSurveyFormPage === "function") {
        renderSurveyFormPage(surveyId);
      } else {
        showError("Survey form page failed to load!");
      }
    },
  },
};

function routeHandler() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const surveyId = params.get("id");

  document.body.innerHTML = "";

  if (path === "/UserViewSurveys") {
    loadCSS("user/css/UserViewSurveys.css");
    loadJS("user/js/UserViewSurveys.js", renderUserViewSurveys);
  } else if (path === "/adminDashboard") {
    loadCSS("admin/css/adminDashboard.css");
    loadJS("admin/js/adminDashboard.js", () => {
      if (typeof window.renderAdminDashboard === "function") {
        window.renderAdminDashboard();
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error: renderAdminDashboard function is not defined.",
        });
      }
    });
  } else if (path === "/survey-form" && surveyId) {
    loadCSS("user/css/SurveyFormPage.css");
    loadJS("user/js/SurveyFormPage.js", () => {
      if (typeof renderSurveyFormPage === "function") {
        renderSurveyFormPage(surveyId);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "renderSurveyFormPage function is not loaded properly.",
        });
      }
    });
  } else {
    loadCSS("home.css");
    createHomePage();
  }
}

window.onpopstate = routeHandler;

function renderUserViewSurveys() {
  loadCSS("user/css/UserViewSurveys.css");

  const domJson = [
    {
      tag: "div",
      class: "header",
      children: [{ tag: "h1", text: "User Dashboard" }],
    },
    {
      tag: "div",
      attributes: { id: "survey-container", class: "container-home" },
    },
    { tag: "div", attributes: { id: "pagination", class: "pagination" } },
  ];

  htmlBuilder(domJson, document.body);

  if (typeof viewSurveys === "function") {
    viewSurveys();
  } else {
    showError("viewSurveys function not loaded properly.");
  }
}
