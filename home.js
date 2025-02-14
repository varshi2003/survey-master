// document.addEventListener("DOMContentLoaded", () => {
//   loadCSS("home.css");
//   routeHandler();
// });


// function loadCSS(href) {
//   if (!document.querySelector(`link[href="${href}"]`)) {
//     const link = document.createElement("link");
//     link.rel = "stylesheet";
//     link.href = href;
//     document.head.appendChild(link);
//   }
// }

// function loadJS(src, callback) {
//   const script = document.createElement("script");
//   script.src = src;
//   script.onload = callback;
//   script.onerror = () => console.error(`Failed to load script: ${src}`);
//   document.body.appendChild(script);
// }

// function createHomePage() {
//   document.body.innerHTML = "";

//   const container = document.createElement("div");
//   container.classList.add("container-home");

//   const cardData = [
//     {
//       title: "Admin",
//       imgSrc: "https://img.icons8.com/ios-filled/100/admin-settings-male.png",
//       link: "/adminDashboard",
//     },
//     {
//       title: "User",
//       imgSrc: "https://img.icons8.com/ios-filled/100/user.png",
//       link: "/UserViewSurveys",
//     },
//   ];

//   cardData.forEach((card) => {
//     const cardElement = document.createElement("div");
//     cardElement.classList.add("card-home");
//     cardElement.onclick = () => navigateTo(card.link);

//     const img = document.createElement("img");
//     img.src = card.imgSrc;
//     img.alt = `${card.title} Icon`;

//     const title = document.createElement("h3");
//     title.textContent = card.title;

//     cardElement.appendChild(img);
//     cardElement.appendChild(title);
//     container.appendChild(cardElement);
//   });

//   document.body.appendChild(container);
// }

// function navigateTo(path, params = {}) {
//   const url = new URL(window.location.origin + path);
//   Object.keys(params).forEach((key) =>
//     url.searchParams.append(key, params[key])
//   );

//   window.history.pushState({}, "", url.toString());
//   routeHandler();
// }

// function routeHandler() {
//   const path = window.location.pathname;
//   const params = new URLSearchParams(window.location.search);
//   const surveyId = params.get("id");

//   document.body.innerHTML = "";

//   if (path === "/UserViewSurveys") {
//     loadJS("user/js/UserViewSurveys.js", renderUserViewSurveys);
//   } else if (path === "/adminDashboard") {
//     loadJS("admin/js/adminDashboard.js", () => {
//       if (typeof window.renderAdminDashboard === "function") {
//         window.renderAdminDashboard();
//       } else {
//         console.error("Error: renderAdminDashboard function is not defined.");
//       }
//     });
//   } else if (path === "/survey-form" && surveyId) {
//     loadJS("user/js/SurveyFormPage.js", () => {
//       if (typeof renderSurveyFormPage === "function") {
//         renderSurveyFormPage(surveyId);
//       } else {
//         console.error("renderSurveyFormPage function is not loaded properly.");
//       }
//     });
//   } else {
//     createHomePage();
//   }
// }

// window.onpopstate = routeHandler;

// function renderUserViewSurveys() {
//   loadCSS("user/css/UserViewSurveys.css");

//   const header = document.createElement("div");
//   header.classList.add("header");
//   const title = document.createElement("h1");
//   title.textContent = "User Dashboard";
//   header.appendChild(title);

//   const surveyContainer = document.createElement("div");
//   surveyContainer.id = "survey-container";
//   surveyContainer.classList.add("container-home");

//   const pagination = document.createElement("div");
//   pagination.id = "pagination";
//   pagination.classList.add("pagination");

//   document.body.appendChild(header);
//   document.body.appendChild(surveyContainer);
//   document.body.appendChild(pagination);

//   if (typeof viewSurveys === "function") {
//     viewSurveys();
//   } else {
//     console.error("viewSurveys function not loaded properly.");
//   }
// }


export  function htmlBuilder(elements, parent) {
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
    script.onerror = () => Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Failed to load script"
    });;
    document.body.appendChild(script);
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
              { tag: "img", attributes: { src: "https://img.icons8.com/ios-filled/100/admin-settings-male.png", alt: "Admin Icon" } },
              { tag: "h3", text: "Admin" }
            ]
          },
          {
            tag: "div",
            class: "card-home",
            attributes: { id: "userCard" },
            children: [
              { tag: "img", attributes: { src: "https://img.icons8.com/ios-filled/100/user.png", alt: "User Icon" } },
              { tag: "h3", text: "User" }
            ]
          }
        ]
      }
    ];
    
    htmlBuilder(domJson, document.body);
    
    
    document.getElementById("adminCard").addEventListener("click", () => navigateTo("/adminDashboard"));
    document.getElementById("userCard").addEventListener("click", () => navigateTo("/UserViewSurveys"));
  }
  
  function navigateTo(path, params = {}) {
    const url = new URL(window.location.origin + path);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    window.history.pushState({}, "", url.toString());
    routeHandler();
  }
  
  function routeHandler() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const surveyId = params.get("id");
    document.body.innerHTML = "";
    
    if (path === "/UserViewSurveys") {
      loadJS("user/js/UserViewSurveys.js", renderUserViewSurveys);
    } else if (path === "/adminDashboard") {
      loadJS("admin/js/adminDashboard.js", () => {
        if (typeof window.renderAdminDashboard === "function") {
          window.renderAdminDashboard();
        } else {
        
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error: renderAdminDashboard function is not defined."
          });
          
        }
      });
    } else if (path === "/survey-form" && surveyId) {
      loadJS("user/js/SurveyFormPage.js", () => {
        if (typeof renderSurveyFormPage === "function") {
          renderSurveyFormPage(surveyId);
        } else {
         
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "renderSurveyFormPage function is not loaded properly.."
          });
        }
      });
    } else {
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
        children: [{ tag: "h1", text: "User Dashboard" }]
      },
      { tag: "div", attributes: { id: "survey-container", class: "container-home" } },
      { tag: "div", attributes: { id: "pagination", class: "pagination" } }
    ];
    
    htmlBuilder(domJson, document.body);
    
    if (typeof viewSurveys === "function") {
      viewSurveys();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "viewSurveys function not loaded properly."
      });
    }
  }
  