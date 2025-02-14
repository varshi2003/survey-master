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

window.renderAdminDashboard = function () {
  document.body.innerHTML = "";

  const domJson = [
    {
      tag: "div",
      class: "container-admin-dashboard",
      children: [
        {
          tag: "h1",
          text: "Admin Dashboard",
        },
        {
          tag: "div",
          class: "card-container-admin-dashboard",
          children: [
            {
              tag: "div",
              class: "card-admin-dashboard",
              attributes: { onclick: "navigateTo('/adminViewSurveys')" },
              children: [
                { tag: "h2", text: "View Surveys" },
                { tag: "p", text: "Check existing surveys and their details." },
              ],
            },
            {
              tag: "div",
              class: "card-admin-dashboard",
              attributes: { onclick: "navigateTo('/adminCreateForm')" },
              children: [
                { tag: "h2", text: "Create Survey" },
                { tag: "p", text: "Design and create a new survey." },
              ],
            },
            {
              tag: "div",
              class: "card-admin-dashboard",
              attributes: { onclick: "navigateTo('/surveyResponseDashboard')" },
              children: [
                { tag: "h2", text: "View Response" },
                {
                  tag: "p",
                  text: "Analyze survey responses submitted by users.",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const elements = htmlBuilder(domJson);
  elements.forEach((el) => document.body.appendChild(el));
};

function navigateTo(page) {
  window.history.pushState({}, "", page);
  routeHandler();
}

function routeHandler() {
  const path = window.location.pathname;
  document.body.innerHTML = "";

  const routes = {
    "/UserViewSurveys": () =>
      loadJS("user/js/UserViewSurveys.js", renderUserViewSurveys),
    "/adminDashboard": () =>
      loadJS("admin/js/adminDashboard.js", () =>
        window.renderAdminDashboard?.()
      ),
    "/adminViewSurveys": () =>
      loadJS("admin/js/adminViewSurveys.js", () =>
        window.renderAdminViewSurveys?.()
      ),
    "/adminCreateForm": () =>
      loadJS("admin/js/adminCreateForm.js", () =>
        window.renderAdminCreateForm?.()
      ),
    "/surveyResponseDashboard": () =>
      loadJS("admin/js/surveyResponseDashboard.js", () =>
        window.renderSurveyResponseDashboard?.()
      ),
  };

  if (routes[path]) {
    routes[path]();
  } else {
    createHomePage();
  }
}

function loadJS(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = () => {
    callback();
  };
  script.onerror = () =>
    Swal.fire({
      icon: "warning",
      title: "Missing Survey ID",
      text: "Survey ID is missing in the URL.",
    });
  document.body.appendChild(script);
}
