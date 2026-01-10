import { getCached } from './cache';

export default async function getSeats(library, id, date) {
  return getCached(`seats_${library}_${id}_${date}`, async () => {
    const response = await fetch(
      'https://reservation.affluences.com/api/resources/' + library + '/available?date=' + date + '&type=' + id
    );
    
    const data = await response.json();
    return data;
  }, { ttl: 30 * 1000 }); // Cache for 30 seconds (seat availability changes frequently)
}

