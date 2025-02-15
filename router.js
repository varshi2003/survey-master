function loadJS(url, callback) {
    const script = document.createElement("script");
    script.src = url;
    script.onload = callback;
    script.onerror = () => {
      console.error(`Failed to load script: ${url}`);
      Swal.fire({ icon: "error", title: "Oops...", text: `Failed to load ${url}` });
    };
    document.body.appendChild(script);
  }
  
  function loadCSS(url) {
    let existingLink = document.querySelector(`link[href='${url}']`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }
  
  function navigateTo(path, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    window.history.pushState({}, "", fullPath);
    routeHandler();
  }
  
  function routeHandler() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const surveyId = params.get("id");
    
    document.body.innerHTML = ""; // Clear existing content
  
    if (path === "/UserViewSurveys") {
      loadCSS("user/css/UserViewSurveys.css");
      loadJS("user/js/UserViewSurveys.js", renderUserViewSurveys);
    } else if (path === "/survey-form" && surveyId) {
      loadCSS("user/css/SurveyFormPage.css");
      loadJS("user/js/SurveyFormPage.js", () => {
        if (typeof renderSurveyFormPage === "function") {
          renderSurveyFormPage(surveyId);
        } else {
          Swal.fire({ icon: "error", title: "Oops...", text: "SurveyFormPage.js failed to load." });
        }
      });
    } else {
      createHomePage();
    }
  }
  
  window.addEventListener("popstate", routeHandler); // Handle browser back/forward navigation
  
  // Initial page load
  document.addEventListener("DOMContentLoaded", routeHandler);
  