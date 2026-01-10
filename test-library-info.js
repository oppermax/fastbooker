// Test to get library info
async function testLibraryInfo() {
  const libraryId = '4b867ddd-46fd-4fe5-a57b-cdd4a3e1520d';

  // Try the site endpoint
  const response = await fetch(
    'https://api.affluences.com/app/v3/sites/' + libraryId
  );

  const data = await response.json();
  console.log('Library Info API Response:');
  console.log(JSON.stringify(data, null, 2));
}

testLibraryInfo().catch(console.error);

