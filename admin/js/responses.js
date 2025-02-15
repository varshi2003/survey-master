// function loadCustomCSS() {
//   document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
//     if (link.href.includes("home.css")) {
//       link.remove();
//     }
//   });
//   const link = document.createElement("link");
//   link.rel = "stylesheet";
//   link.href = "admin/css/responses.css";
//   document.head.appendChild(link);
// }

// window.renderSurveyResponses = function (surveyId) {
//   loadCustomCSS();
//   document.body.innerHTML = "";

//   const container = document.createElement("div");
//   container.className = "response-details-container";

//   const heading = document.createElement("h1");
//   heading.textContent = "Survey Responses";
//   container.appendChild(heading);

//   const responseContainer = document.createElement("div");
//   responseContainer.id = "response-container";
//   responseContainer.className = "response-details-card-container";
//   container.appendChild(responseContainer);

//   const backButton = document.createElement("a");
//   backButton.textContent = "Back to Home";
//   backButton.className = "back-btn";
//   backButton.href = "/home";
//   backButton.onclick = function (event) {
//     event.preventDefault();
//     window.history.pushState({}, "", "/surveyResponseDashboard");
//     routeHandler();
//     location.reload();
//   };
//   container.appendChild(backButton);

//   document.body.appendChild(container);
//   if (!window.surveyId) {
//     const urlParams = new URLSearchParams(window.location.search);
//     window.surveyId = urlParams.get("id");
//   }

//   if (!surveyId) {
//     return;
//   }

//   fetch(
//     `http://localhost:8080/api/survey-responses/form-names?surveyId=${surveyId}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   )
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       if (!Array.isArray(data) || data.length === 0) {
//         responseStructure.children = [
//           {
//             tag: "p",
//             text: "No responses found for this survey.",
//           },
//         ];
//         renderJSON(
//           responseStructure,
//           document.getElementById("response-container")
//         );
//         return;
//       }

//       const filteredResponses = data.filter(
//         (response) => response.surveyId === surveyId
//       );

//       responseStructure.children = [];

//       if (filteredResponses.length === 0) {
//         responseStructure.children.push({
//           tag: "p",
//           text: "No responses found for this survey.",
//         });
//       } else {
//         filteredResponses.forEach((response) => {
//           responseStructure.children.push({
//             tag: "div",
//             attributes: { class: "response-details-card" },
//             children: [{ tag: "h3", text: response.name }],
//             events: {
//               click: () => {
//                 // console.log(
//                 //   `Navigating to responseDetails for ID: ${response.id}`
//                 // );
//                 window.history.pushState(
//                   {},
//                   "",
//                   `#/responseDetails?id=${response.id}&surveyId=${surveyId}`
//                 );
//                 routeHandler();
//               },
//             },
//           });
//         });
//       }

//       renderJSON(
//         responseStructure,
//         document.getElementById("response-container")
//       );
//     })
//     .catch((error) => {
//       Swal.fire({
//         icon: "error",
//         title: "Oops...",
//         text: "Error fetching survey responses! Please try again later.",
//       });
//     });
// };

// function routeHandler() {
//   const hash = window.location.hash;
//   const path = window.location.pathname;

//   if (path === "/surveyResponseDashboard") {
//     // Load surveyResponseDashboard.js for path-based navigation
//     import("./surveyResponseDashboard.js")
//       .then((module) => {
//         module.loadSurveyDashboard();
//       })
//       .catch((error) =>
//         console.error("Failed to load surveyResponseDashboard.js", error)
//       );

//   }

//   if (hash.startsWith("#/responseDetails")) {
//     const params = new URLSearchParams(hash.split("?")[1]);
//     const surveyResponseId = params.get("id");
//     const surveyId = params.get("surveyId");

//     if (surveyResponseId && surveyId) {
//       import("./responseDetails.js")
//         .then((module) => {
//           module.loadResponseDetails(surveyResponseId, surveyId);
//         })
//         .catch((error) =>
//           console.error("Failed to load responseDetails.js", error)
//         );
//     } else {
//       console.error("Survey Response ID or Survey ID is missing in URL.");
//     }
//   } else if (hash.startsWith("#/adminViewForm")) {
//     const params = new URLSearchParams(hash.split("?")[1]);
//     const surveyId = params.get("id");

//     if (surveyId) {
//       loadAdminViewForm(surveyId);
//     } else {
//       console.error("Survey ID is missing in URL.");
//     }
//   } else if (hash.startsWith("#/adminViewSurveys")) {
//     renderAdminViewSurveys();
//   }
// }

// function renderJSON(json, parent, preserveExisting = false) {
//   if (!preserveExisting) {
//     parent.innerHTML = "";
//   }

//   json.children.forEach((element) => {
//     let existingElement = document.getElementById(element.attributes?.id);
//     let el = existingElement || document.createElement(element.tag);

//     if (element.attributes) {
//       Object.entries(element.attributes).forEach(([key, value]) =>
//         el.setAttribute(key, value)
//       );
//     }

//     if (element.text) {
//       el.textContent = element.text;
//     }

//     if (element.events && !existingElement) {
//       Object.entries(element.events).forEach(([event, handler]) =>
//         el.addEventListener(event, handler)
//       );
//     }

//     if (element.children) {
//       renderJSON({ children: element.children }, el, preserveExisting);
//     }

//     if (!existingElement) {
//       parent.appendChild(el);
//     }
//   });
// }

// const responseStructure = {
//   tag: "div",
//   attributes: { id: "response-container" },
//   children: [],
// };

// document.addEventListener("DOMContentLoaded", renderSurveyResponses);

// // Listen for hash changes
// window.addEventListener("hashchange", routeHandler);

// // Listen for path-based navigation (back/forward buttons)
// window.addEventListener("popstate", routeHandler);

// Function to load the custom CSS for this page


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

// Function to handle navigation without reloading
function navigateTo(page) {
  window.history.pushState({}, "", page);
  routeHandler();
}

// Function to render survey responses
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
    navigateTo("/surveyResponseDashboard"); // Proper navigation to dashboard
  };
  container.appendChild(backButton);

  document.body.appendChild(container);

  // Ensure surveyId is correctly extracted
  if (!surveyId) {
    const urlParams = new URLSearchParams(window.location.search);
    surveyId = urlParams.get("id");
  }

  if (!surveyId) {
    console.error("Survey ID is missing.");
    return;
  }

  fetch(
    `http://localhost:8080/api/survey-responses/form-names?surveyId=${surveyId}`,
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
          { children: [{ tag: "p", text: "No responses found for this survey." }] },
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
                navigateTo(`/responseDetails?id=${response.id}&surveyId=${surveyId}`);
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

// Routing logic
// function routeHandler() {
//   const path = window.location.pathname;

//   const routes = {
//    "/surveyResponseDashboard": () =>
//       loadJS("admin/js/surveyResponseDashboard.js", () =>
//         window.renderSurveyResponseDashboard?.()
//       ),
//     "/responseDetails": () => {
//       const params = new URLSearchParams(window.location.search);
//       const surveyResponseId = params.get("id");
//       const surveyId = params.get("surveyId");

//       if (surveyResponseId && surveyId) {
//         import("./responseDetails.js")
//           .then((module) => {
//             module.loadResponseDetails(surveyResponseId, surveyId);
//           })
//           .catch((error) =>
//             console.error("Failed to load responseDetails.js", error)
//           );
//       } else {
//         console.error("Survey Response ID or Survey ID is missing in URL.");
//       }
//     },
//     "/adminViewForm": () => {
//       const params = new URLSearchParams(window.location.search);
//       const surveyId = params.get("id");

//       if (surveyId) {
//         loadAdminViewForm(surveyId);
//       } else {
//         console.error("Survey ID is missing in URL.");
//       }
//     },
//     "/adminViewSurveys": () => {
//       renderAdminViewSurveys();
//     },
//   };

//   if (routes[path]) {
//     routes[path]();
//   } else {
//     console.error("404 - Page Not Found");
//     document.body.innerHTML = "<h1>404 - Page Not Found</h1>";
//   }
// }

// Ensure /surveyResponses is a valid route
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
      console.log("Loading survey responses for ID:", surveyId);
      loadJS("admin/js/responses.js", () => {
        if (typeof window.renderSurveyResponses === "function") {
          window.renderSurveyResponses(surveyId);
        } else {
          console.error("renderSurveyResponses function not found in responses.js");
        }
      });
    },

    "/responseDetails": () => {
      const surveyResponseId = urlParams.get("id");
      const surveyId = urlParams.get("surveyId");

      if (surveyResponseId && surveyId) {
        import("./responseDetails.js")
          .then((module) => {
            module.loadResponseDetails(surveyResponseId, surveyId);
          })
          .catch((error) =>
            console.error("Failed to load responseDetails.js", error)
          );
      } else {
        console.error("Survey Response ID or Survey ID is missing in URL.");
      }
    },

    "/adminViewForm": () => {
      if (surveyId) {
        loadAdminViewForm(surveyId);
      } else {
        console.error("Survey ID is missing in URL.");
      }
    },

    "/adminViewSurveys": () => {
      renderAdminViewSurveys();
    },
  };

  if (routes[path]) {
    routes[path]();
  } else {
    console.error(`404 - Page Not Found: ${path}`);
    document.body.innerHTML = "<h1>404 - Page Not Found</h1>";
  }
}

// 🔹 Ensure routeHandler runs when page loads
document.addEventListener("DOMContentLoaded", routeHandler);
window.addEventListener("popstate", routeHandler);


// Function to render JSON dynamically
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

// Response structure template
const responseStructure = {
  tag: "div",
  attributes: { id: "response-container" },
  children: [],
};

// Ensure survey ID is passed correctly
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get("id");
  renderSurveyResponses(surveyId);
});

// Listen for path-based navigation (back/forward buttons)
window.addEventListener("popstate", routeHandler);
