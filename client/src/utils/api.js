const API_URL = "http://localhost:5000/api";

export const parsePDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/parse`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
};

export const verifyPhoneNumberAPI = async (phone_number) => {
  const response = await fetch("http://localhost:5000/api/verify-phone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number }),
  });

  if (!response.ok) {
    throw new Error("Failed to verify phone number");
  }

  return response.json();
};

export const saveParsedData = async (parsedData) => {
  await fetch(`${API_URL}/discharges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ discharges: parsedData }),
  });
};

export const fetchDischarges = async (page, itemsPerPage, sortField, sortOrder) => {
  const response = await fetch(`${API_URL}/discharges?page=${encodeURI(page)}&limit=${encodeURI(itemsPerPage)}&sortField=${encodeURI(sortField)}&sortOrder=${encodeURI(sortOrder)}`);
  return await response.json();
};
