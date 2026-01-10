export default async function getLibraries() {
  const body = {
    search_query: "Padova",
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
      console.error(`Failed to fetch libraries: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.data || !data.data.results) {
      console.error(`Invalid API response structure`);
      return [];
    }
    
    const results = data.data.results;
    
    // Filter out any invalid entries that might be missing required fields
    const validLibraries = results.filter(library => 
      library && 
      library.id && 
      library.primary_name
    );

    console.log(`Total libraries fetched: ${results.length}, Valid: ${validLibraries.length}`);
    
    return validLibraries;
  } catch (error) {
    console.error(`Error fetching libraries:`, error);
    return [];
  }
}
