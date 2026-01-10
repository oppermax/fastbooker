// Quick test to check API response structure
async function testFloors() {
  const libraryId = '4b867ddd-46fd-4fe5-a57b-cdd4a3e1520d'; // Biblioteca Centrale

  const response = await fetch(
    'https://reservation.affluences.com/api/site/' + libraryId + '/types'
  );

  const data = await response.json();
  console.log('Full API Response:');
  console.log(JSON.stringify(data, null, 2));

  console.log('\n\nFirst floor object:');
  if (data.types && data.types[0]) {
    console.log(JSON.stringify(data.types[0], null, 2));
    console.log('\n\nAll keys in first floor:');
    console.log(Object.keys(data.types[0]));
  }
}

testFloors().catch(console.error);

