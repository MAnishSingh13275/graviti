// pages/index.js
import MapComponent from '../components/MapComponent';
import Logo from '../assets/Graviti Logo 1.png'

const Home = () => {
  return (
    <div>
      <header>
        <img width={120} className='ml-5 py-2' src={Logo.src} alt="Graviti Logo" />
      </header>
      <MapComponent />
    </div>
  );
};

export default Home;
