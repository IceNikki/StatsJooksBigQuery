import { db } from '../config/firebase';
import { collection, getDocs } from "firebase/firestore";
import Fuse from 'fuse.js';

export async function citysuggester(city_name) {
  const citiesRef = collection(db, 'City');
  const querySnapshot = await getDocs(citiesRef);

  const cityData = [];
  querySnapshot.forEach((doc) => {
    cityData.push(doc.data());
  });

  const options = {
    includeScore: true,
    keys: ['nameCity']
  };
  const fuse = new Fuse(cityData, options);
  const result = fuse.search(city_name);

  if (result.length === 0) {
    return null;
  }

  return result[0].item.nameCity;
}
