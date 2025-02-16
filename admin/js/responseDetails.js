window.loadResponseDetails = loadResponseDetails;
function loadSweetAlert() {
  return new Promise((resolve) => {
    if (typeof Swal !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}
function loadCustomCSS() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href.includes("home.css")) {
      link.remove();
    }
  });
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "admin/css/responseDetails.css";
  document.head.appendChild(link);
}

export function loadResponseDetails(surveyResponseId, surveyId) {
  loadCustomCSS();
  loadSweetAlert().then(() => {
    document.body.innerHTML = "";

    const container = document.createElement("div");
    container.className = "responseDetailsContainer";

    const title = document.createElement("h1");
    title.textContent = "Survey Response Details";
    container.appendChild(title);

    const responseContainer = document.createElement("div");
    responseContainer.id = "response-details";
    responseContainer.className = "rd-response-container";
    container.appendChild(responseContainer);

    const btnContainer = document.createElement("div");
    btnContainer.className = "rd-btn-container";

    const acceptButton = document.createElement("button");
    acceptButton.className = "btn accept";
    acceptButton.textContent = "Accept";
    btnContainer.appendChild(acceptButton);

    const rejectButton = document.createElement("button");
    rejectButton.className = "btn reject";
    rejectButton.textContent = "Reject";
    btnContainer.appendChild(rejectButton);

    // const backButton = document.createElement("a");
    // backButton.href = "javascript:void(0)";
    // backButton.className = "back-btn";
    // backButton.textContent = "Back to Responses";
    // backButton.addEventListener("click", () => {
    //   window.history.pushState({}, "", "/surveyResponses");
    //   routeHandler();
    // });
    // btnContainer.appendChild(backButton);

    container.appendChild(btnContainer);
    document.body.appendChild(container);

    fetchSurveyResponse(surveyResponseId, surveyId);
  });
}

function fetchSurveyResponse(surveyResponseId, surveyId) {
  if (!surveyResponseId) {
    Swal.fire({
      icon: "warning",
      title: "Survey ID Not Found!",
      text: "Please check the survey ID and try again.",
    });

    return;
  }

  fetch(`http://localhost:8080/api/survey-responses/${surveyResponseId}`)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const responseContainer = document.getElementById("response-details");
      responseContainer.innerHTML = "";

      data.responses.forEach((item) => {
        const card = document.createElement("div");
        card.className = "response-card";

        const questionHeading = document.createElement("h3");
        questionHeading.textContent = item.question;
        card.appendChild(questionHeading);

        let answerContent = Array.isArray(item.answer)
          ? item.answer.join(", ")
          : item.answer;

        const answerParagraph = document.createElement("p");
        answerParagraph.innerHTML = `<strong>Answer: </strong>${answerContent}`;
        card.appendChild(answerParagraph);

        const requiredParagraph = document.createElement("p");
        requiredParagraph.innerHTML = `<strong>Required: </strong>${
          item.required ? "Yes" : "No"
        }`;
        card.appendChild(requiredParagraph);

        responseContainer.appendChild(card);
      });

      fetch(
        `http://localhost:8080/api/result-dashboard/status/${surveyId}/${surveyResponseId}`
      )
        .then((response) => response.text())
        .then((status) => {
          const statusMessage = document.createElement("p");
          statusMessage.id = "status-message";
          statusMessage.style.fontWeight = "bold";
          statusMessage.style.color =
            status === "Accepted"
              ? "green"
              : status === "Rejected"
              ? "red"
              : "blue";
          statusMessage.textContent = `Status: ${status}`;
          responseContainer.appendChild(statusMessage);

          setupActionButtons(surveyId, surveyResponseId, status);
        });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch survey details. Please try again later.",
        footer: `<strong>Error Details:</strong> ${error.message || error}`,
      });
    });
}

document.addEventListener("DOMContentLoaded", loadResponseDetails);

function setupActionButtons(surveyId, surveyResponseId, status) {
  const acceptButton = document.querySelector("button.btn.accept");
  const rejectButton = document.querySelector("button.btn.reject");
  const statusMessage = document.getElementById("status-message");

  function updateStatus(newStatus, color) {
    statusMessage.textContent = `Status: ${newStatus}`;
    statusMessage.style.color = color;
  }

  if (status === "Accepted") {
    acceptButton.disabled = true;
    rejectButton.disabled = false;
  } else if (status === "Rejected") {
    rejectButton.disabled = true;
    acceptButton.disabled = false;
  }

  if (acceptButton) {
    acceptButton.addEventListener("click", () => {
      if (acceptButton.disabled) return;

      fetch("http://localhost:8080/api/result-dashboard/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId, surveyResponseId }),
      })
        .then((response) =>
          response.ok ? response.json() : Promise.reject("Error")
        )
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Response accepted successfully!",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          updateStatus("Accepted", "green");
          acceptButton.disabled = true;
          rejectButton.disabled = false;
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Oops!",
            text: "Something went wrong. Please try again later.",
            footer: `<p style="color:red;">Error Details: ${error.message}</p>`,
          });
        });
    });
  }

  if (rejectButton) {
    rejectButton.addEventListener("click", () => {
      if (rejectButton.disabled) return;

      fetch("http://localhost:8080/api/result-dashboard/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId, surveyResponseId }),
      })
        .then((response) =>
          response.ok ? response.json() : Promise.reject("Error")
        )
        .then(() => {
          Swal.fire({
            icon: "warning",
            title: "Rejected!",
            text: "Response has been rejected successfully.",
            confirmButtonColor: "#d33",
            confirmButtonText: "OK",
          });

          updateStatus("Rejected", "red");
          rejectButton.disabled = true;
          acceptButton.disabled = false;
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Oops!",
            text: "Something went wrong. Please try again later.",
            footer: `<p style="color:red;">Error Details: ${error.message}</p>`,
          });
        });
    });
  }
}
