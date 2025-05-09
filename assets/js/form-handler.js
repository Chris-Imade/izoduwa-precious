document.addEventListener("DOMContentLoaded", function () {
  console.log("Form handler script loaded and DOMContentLoaded.");

  // --- Configuration ---
  // !!! IMPORTANT: Replace this with your actual backend API endpoint !!!
  const API_ENDPOINT = "http://localhost:3000/send-email";
  // --- End Configuration ---

  const contactForms = document.querySelectorAll("form#contact-form");
  console.log(`Found ${contactForms.length} contact form(s).`);

  contactForms.forEach((form, index) => {
    console.log(
      `Attaching submit listener to form ${index + 1} with id: ${
        form.id
      } on page: ${window.location.pathname}`
    );

    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent default form submission
      console.log(
        `Submit event triggered for form ${index + 1} on page: ${
          window.location.pathname
        }`
      );

      const messagesDiv = form.querySelector(".messages");
      const submitButton = form.querySelector('button[type="submit"]');
      let originalButtonHTML = "";

      if (submitButton) {
        originalButtonHTML = submitButton.innerHTML;
      } else {
        console.error("Submit button not found for this form.");
        // It might be good to prevent further execution if the button is missing
        // as the UI won't update correctly.
      }

      if (messagesDiv) {
        messagesDiv.innerHTML = ""; // Clear previous messages
      } else {
        console.warn(
          "Messages div (.messages) not found for this form. Messages will not be displayed."
        );
      }

      const formData = {
        name: form.querySelector("#form_name")?.value || "",
        email: form.querySelector("#form_email")?.value || "",
        subject: form.querySelector("#form_subject")?.value || "", // Subject is optional
        message: form.querySelector("#form_message")?.value || "",
      };
      console.log("Form data collected:", formData);

      // Basic client-side validation
      if (!formData.name || !formData.email || !formData.message) {
        displayMessage(
          messagesDiv,
          "Name, email, and message are required.",
          "error"
        );
        return;
      }
      if (!validateEmail(formData.email)) {
        displayMessage(
          messagesDiv,
          "Please enter a valid email address.",
          "error"
        );
        return;
      }

      // Show loading state on button
      if (submitButton) {
        submitButton.innerHTML = `
                    <span class="form-spinner"></span> Sending...
                `;
        submitButton.disabled = true;
      }

      try {
        console.log("Attempting to fetch API_ENDPOINT:", API_ENDPOINT);
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        });
        console.log("Response status from server:", response.status);

        let data = {};
        try {
          data = await response.json();
          console.log("Server response data (parsed JSON):", data); // <<< THIS IS A VERY IMPORTANT LOG
        } catch (e) {
          console.error("Failed to parse server response as JSON:", e);
          const textResponse = await response.text(); // Attempt to get response as text if JSON parsing fails
          console.error("Server response text (if not JSON):", textResponse);
          displayMessage(
            messagesDiv,
            "Received an invalid (non-JSON) response from the server. Please check server logs.",
            "error"
          );
          // Restore button if it exists
          if (submitButton) {
            submitButton.innerHTML = originalButtonHTML;
            submitButton.disabled = false;
          }
          return; // Exit after displaying error, as we can't process further
        }

        if (response.ok && data.success) {
          const successMessage =
            "Message received successfully! We'll get back to you within 24-48 hours.";
          displayMessage(messagesDiv, successMessage, "success");
          form.reset(); // Clear the form
        } else {
          let errorMessage = "Failed to send message. Please try again."; // Default message
          if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            // Some responses might use 'message' for errors too
            errorMessage = data.message;
          } else if (!response.ok) {
            errorMessage = `Server responded with an error: ${response.status}.`;
          }
          displayMessage(messagesDiv, errorMessage, "error");
        }
      } catch (error) {
        console.error(
          "Fetch API call itself failed (e.g., network error, CORS issue, server down):",
          error
        );
        displayMessage(
          messagesDiv,
          "Could not connect to the submission server. Please check your internet connection or try again later.",
          "error"
        );
      } finally {
        // Restore button state
        if (submitButton) {
          submitButton.innerHTML = originalButtonHTML;
          submitButton.disabled = false;
        }
      }
    });
  });

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function displayMessage(container, message, type = "error") {
    console.log(
      `Displaying message - Type: ${type}, Message: "${message}", Container found: ${!!container}`
    );
    if (container) {
      const alertClass = type === "success" ? "alert-success" : "alert-danger";
      container.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    } else {
      // If messagesDiv wasn't found, at least log to console
      console.warn(
        `Message display failed: No container. Type: ${type}, Message: "${message}"`
      );
    }
  }

  // --- CSS for Messages and Spinner (dynamically added) ---
  // You can move this to your main stylesheet if preferred.
  const style = document.createElement("style");
  style.textContent = `
        .alert {
            padding: 0.75rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.25rem;
            font-size: 0.9rem;
            text-align: left;
        }
        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }
        .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }
        .form-spinner {
            display: inline-block;
            width: 1em;
            height: 1em;
            vertical-align: -0.125em;
            border: 0.2em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: form-spinner-spin .75s linear infinite;
            margin-right: 0.5em;
        }
        @keyframes form-spinner-spin {
            to { transform: rotate(360deg); }
        }
    `;
  document.head.appendChild(style);
  console.log("Dynamic CSS for alerts and spinner appended to head.");
});
