import getLibraries from '@/lib/getLibraries';
import LibraryTile from './LibraryTile';

export default async function Home() {
  const libraries = await getLibraries();
  return (
    <main className="py-8 px-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to FastBooker</h1>
          <p className="text-lg text-gray-600">Book your seat in one go!</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
        {libraries.map((floor, i) => (
          floor.booking_available && (
            <div key={i}>
              <LibraryTile
                name={floor.primary_name}
                image={floor.poster_image}
                id={floor.id}
              />
            </div>
          )
        ))}
      </div>
    </main>
  );
}