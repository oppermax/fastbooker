import getLibraries from '@/lib/getLibraries';
import getLibrarySeatCount from '@/lib/getLibrarySeatCount';
import LibraryTile from './LibraryTile';

export default async function Home() {
  const libraries = await getLibraries();

  // Fetch seat counts for all libraries in parallel
  const librariesWithCounts = await Promise.all(
    libraries.map(async (library) => {
      const seatCount = await getLibrarySeatCount(library.id);
      return {
        ...library,
        seatCount
      };
    })
  );

  // Sort libraries by seat count (descending - largest first)
  const sortedLibraries = librariesWithCounts.sort((a, b) => b.seatCount - a.seatCount);


  return (
    <main className="py-8 px-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to FastBooker</h1>
          <p className="text-lg text-gray-600">Book your seat in one go!</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
        {sortedLibraries.map((library, i) => (
          <div key={i}>
            <LibraryTile
              name={library.primary_name}
              image={library.poster_image}
              id={library.id}
              closed={library.closed}
              seatCount={library.seatCount}
              occupancy={library.current_forecast?.occupancy}
            />
          </div>
        ))}
      </div>
    </main>
  );
}