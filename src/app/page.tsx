// pages/index.js
import MapComponent from '../components/MapComponent';
import Logo from '../assets/Graviti Logo 1.png'
import Image from 'next/image';

const Home = () => {
  return (
    <div>
      <header>
        <Image width={120} height={100} className='ml-5 py-2' src={Logo.src} alt="Graviti Logo" />
      </header>
      <MapComponent />
    </div>
  );
};

export default Home;
