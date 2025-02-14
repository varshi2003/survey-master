if (!window.surveyStructure) {
  window.surveyStructure = [];
}

window.renderAdminViewSurveys = function () {
  document.body.innerHTML = "";
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "admin/css/adminViewSurveys.css"; 
  document.head.appendChild(link);

  const header = document.createElement("div");
  header.className = "view-surveys-header";
  const heading = document.createElement("h1");
  heading.textContent = "Survey Forms";
  header.appendChild(heading);

  const formBuilder = document.createElement("div");
  formBuilder.id = "form-builder";
  const surveyContainer = document.createElement("div");
  surveyContainer.id = "survey-container";
  surveyContainer.class = "admin-survey-container";
  const pagination = document.createElement("div");
  pagination.id = "pagination";

  document.body.appendChild(header);
  document.body.appendChild(formBuilder);
  document.body.appendChild(surveyContainer);
  document.body.appendChild(pagination);

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
  document.body.appendChild(script);

  viewSurveys();
};

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
     

      if (!data || !data.content || data.content.length === 0) {
        document.getElementById("survey-container").innerHTML =
          "<p>No surveys available.</p>";
        return;
      }

      const surveyContainer = document.getElementById("survey-container");
      surveyContainer.innerHTML = "";
      surveyContainer.classList.add("survey-grid");

      data.content.forEach((survey) => {
        const card = document.createElement("div");
        card.className = "card-admin-view-surveys";

        if (survey.imageUrl) {
          const img = document.createElement("img");
          img.src = survey.imageUrl;
          img.alt = survey.name;
          img.className = "survey-image";
          card.appendChild(img);
        }

        const title = document.createElement("h3");
        title.className = "survey-title";
        title.textContent = survey.name;
        card.appendChild(title);

        const description = document.createElement("p");
        description.className = "survey-description";
        description.textContent = survey.description;
        card.appendChild(description);

        card.onclick = () => {
          window.location.hash = `#/adminViewForm?id=${survey.id}`;
        };

        surveyContainer.appendChild(card);
      });

      updatePagination(data);
    })
    .catch((error) => {
    
      Swal.fire({
        icon: "error",
        title: "Error Fetching Surveys",
        text: `Failed to load surveys. Error: ${error.message}`,
      });
    });
}


function updatePagination(data) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (data.totalPages > 1) {
   
    const paginationWrapper = document.createElement("div");
    paginationWrapper.className = "pagination-wrapper";
    paginationWrapper.style.display = "flex";
    paginationWrapper.style.alignItems = "center";
    paginationWrapper.style.justifyContent = "center";
    paginationWrapper.style.gap = "15px";

    if (currentPage > 0) {
      const prevButton = document.createElement("button");
      prevButton.className = "pagination-button";
      prevButton.textContent = "Prev";
      prevButton.onclick = () => {
        currentPage--;
        viewSurveys(currentPage);
      };
      paginationWrapper.appendChild(prevButton);
    }

    const pageInfo = document.createElement("span");
    pageInfo.className = "page-info";
    pageInfo.textContent = `Page ${currentPage + 1} of ${data.totalPages}`;
    paginationWrapper.appendChild(pageInfo);

    if (currentPage < data.totalPages - 1) {
      const nextButton = document.createElement("button");
      nextButton.className = "pagination-button";
      nextButton.textContent = "Next";
      nextButton.onclick = () => {
        currentPage++;
        viewSurveys(currentPage);
      };
      paginationWrapper.appendChild(nextButton);
    }

    pagination.appendChild(paginationWrapper);
  }
}


if (window.location.pathname === "/adminViewSurveys") {
  window.renderAdminViewSurveys();
}

function routeHandler() {
  const hash = window.location.hash;
 

  if (hash.startsWith("#/adminViewForm")) {
    const params = new URLSearchParams(hash.split("?")[1]);
    const surveyId = params.get("id");

 

    if (surveyId) {
      loadAdminViewForm(surveyId);
    } else {
      

    }
  } else if (hash.startsWith("#/adminViewSurveys")) {
    renderAdminViewSurveys();
  }
}

function loadAdminViewForm(surveyId) {
  document.body.innerHTML = ""; 


  if (!window.adminViewFormLoaded) {
    const script = document.createElement("script");
    script.src = "admin/js/adminViewForm.js";
    script.onload = () => {
     
      window.adminViewFormLoaded = true; 

     
      setTimeout(() => {
        if (typeof getSurvey === "function") {
          getSurvey(surveyId);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error Fetching Surveys",
            text: `Survey Id is not available`,
          });
        }
      }, 300); 
    };
    document.body.appendChild(script);
  } else {
    setTimeout(() => getSurvey(surveyId), 200); 
  }
}

window.addEventListener("hashchange", routeHandler);
window.addEventListener("load", routeHandler);

routeHandler();
