import { getCached } from './cache';

export default async function getFloors(id) {
  return getCached(`floors_${id}`, async () => {
    const response = await fetch(
      'https://reservation.affluences.com/api/site/' + id + '/types'
    );

    const data = await response.json();
    return data.types;
  });
}

