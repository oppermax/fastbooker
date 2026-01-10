import Image from 'next/image'
import EmailInput from '@/components/EmailInput'
import getBSHFloors from '@/lib/getFloors';
import FloorTile from '@/components/FloorTile';
import getFloors from '@/lib/getFloors';
import Link from 'next/link';
import ViewAllSeatsButton from './ViewAllSeatsButton';

export  default async function Home({params}) {
  const floors = await getFloors(params.id);
  return (
    <main>
      <center>
      <div className='flex flex-col justify-center'>
        <div>
          <p className='text-xl'>Book your seat in one go !</p>
        </div>
        <div className='mt-3'>
          <ViewAllSeatsButton libraryId={params.id} />
        </div>
        </div>
      </center>
      <div className='flex flex-wrap justify-center mt-4'>
        {floors.map((floor, i) => (
          <div className='m-2'key={i} >
            <FloorTile
              name={floor.localized_description}
              image={floor.image}
              libraryId={params.id}
              id={floor.resource_type}
            />
          </div>
            ))}
      </div>


    </main>
  )
}