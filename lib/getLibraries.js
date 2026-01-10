export default async function getLibraries() {
  const allResults = [];
  let currentPage = 0;
  let hasMorePages = true;

  while (hasMorePages) {
    const body = {
      search_query: "Padova",
      page: currentPage,
    };
    
    try {
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
      
      if (!response.ok) {
        console.error(`Failed to fetch libraries page ${currentPage}: ${response.status} ${response.statusText}`);
        break;
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data || !data.data || !data.data.results) {
        console.error(`Invalid API response structure on page ${currentPage}`);
        break;
      }
      
      const results = data.data.results;
      
      // If we get an empty results array, we've reached the end
      if (results.length === 0) {
        hasMorePages = false;
        break;
      }
      
      allResults.push(...results);
      
      // Check if there are more pages using multiple indicators
      // 1. Check if results array is smaller than max page size
      // 2. Check for explicit 'next' indicator if available
      // 3. Check if we've reached the total count if available
      const hasNext = data.data.next !== undefined ? data.data.next : null;
      const total = data.data.total !== undefined ? data.data.total : null;
      
      if (hasNext === false) {
        // Explicit indicator that there are no more pages
        hasMorePages = false;
      } else if (total !== null && allResults.length >= total) {
        // We've fetched all available results
        hasMorePages = false;
      } else if (results.length < data.data.max_size) {
        // Fewer results than page size means this is the last page
        hasMorePages = false;
      } else {
        currentPage++;
        // Add delay between requests to be respectful of Affluences' infrastructure
        // This helps prevent abuse and reduces server load
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }
    } catch (error) {
      console.error(`Error fetching libraries page ${currentPage}:`, error);
      break;
    }
  }

  // Filter out any invalid entries that might be missing required fields
  const validLibraries = allResults.filter(library => 
    library && 
    library.id && 
    library.primary_name
  );

  console.log(`Total libraries fetched: ${allResults.length}, Valid: ${validLibraries.length}`);
  
  return validLibraries;
}
