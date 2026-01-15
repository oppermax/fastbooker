import getLibraries from '@/lib/getLibraries';
import LibraryList from './LibraryList';

export default async function Home() {
  // Fetch libraries on the server side
  let libraries = [];
  try {
    libraries = await getLibraries();
  } catch (error) {
    console.error('Failed to load libraries:', error);
  }

  return (
    <main className="py-8 px-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to FastBooker</h1>
          <p className="text-lg text-gray-600">Book your seat in one go!</p>
        </div>
      </div>
      
      <LibraryList libraries={libraries} />
    </main>
  );
}