const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Check your connection and try again.';

export async function reviewAgreement(file) {
  const formData = new FormData();
  formData.append('agreement', file);

  let response;
  let data;
  try {
    response = await fetch('/api/review', {
      method: 'POST',
      body: formData,
    });
    data = await response.json();
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong while reviewing your agreement.');
  }

  return data;
}
