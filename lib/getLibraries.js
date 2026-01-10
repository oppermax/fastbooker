export default async function getLibraries() {
  const allResults = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const body = {
      search_query: "Padova",
      page: currentPage,
    };
    
    const response = await fetch("https://api.affluences.com/app/v3/sites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "fr",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.110 Safari/537.36",
        "Origin": "https://affluences.com",
        "Referer": "https://affluences.com/",
        "Sec-Fetch-Site": "same-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Sec-Ch-Ua": "",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": ""
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    const results = data.data.results;
    
    allResults.push(...results);
    
    // Check if there are more pages
    // If results are less than max_size, we've reached the last page
    if (results.length < data.data.max_size) {
      hasMorePages = false;
    } else {
      currentPage++;
    }
  }

  return allResults;
}
