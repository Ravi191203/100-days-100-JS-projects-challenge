// Mapping countries to their cities
const cityData = {
  India: ["Mumbai", "Delhi", "Bangalore", "Chennai"],
  USA: ["New York", "Los Angeles", "Chicago", "Houston"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth"],
};

// Elements
const countrySelect = document.getElementById("country");
const citySelect = document.getElementById("city");
const userForm = document.getElementById("userForm");

// Event listener to populate cities dynamically
countrySelect.addEventListener("change", (e) => {
  const selectedCountry = e.target.value;

  // Clear existing city options
  citySelect.innerHTML = '<option value="" disabled selected>Select a city</option>';

  // Populate new city options
  if (selectedCountry && cityData[selectedCountry]) {
    cityData[selectedCountry].forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
});

// Form submission handler
userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const country = countrySelect.value;
  const city = citySelect.value;

  console.log("User Information:");
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Country: ${country}`);
  console.log(`City: ${city}`);
});
