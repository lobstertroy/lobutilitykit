export default async function backoffFetch(url, options, retries = 5, delay = 500, timeout = 5000) {
  let currentRetry = 0;

  const isRetryableError = error => {
    return (error.message === "Failed to fetch" || error.message === "Network request failed" || error.message === "Request timed out");
  };

  while (currentRetry <= retries) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort, timeout);

      let resp = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      const data = await resp.json();

      if (data.error && (data.error.status_code === 429 || data.error.status_code[0] === 5)) throw new Error(data.error)

      return data;
    } catch (error) {
      if ([401, 404, 422].some((code) => error.toString().includes(code.toString()))) throw new Error(error);

      if (isRetryableError(error)) {
        console.warn("Retrying due to", error.message);
        continue;
      } else {
        currentRetry++;
        if (currentRetry > retries) throw new Error(error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, currentRetry)))
    }
  }
}
