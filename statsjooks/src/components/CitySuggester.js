import { db } from '../config/firebase';
import { collection, getDocs } from "firebase/firestore";
import Fuse from 'fuse.js';

// Adjusted to search by document ID
export async function citysuggester(searchId, collectionName) {
  const targetRef = collection(db, collectionName);
  const querySnapshot = await getDocs(targetRef);

  const searchData = [];
  querySnapshot.forEach((doc) => {
    // Include the document ID in the data for searching
    searchData.push({ id: doc.id, ...doc.data() });
  });

  const options = {
    includeScore: true,
    // Now searching through the 'id' field
    keys: ['id']
  };
  const fuse = new Fuse(searchData, options);
  const result = fuse.search(searchId);

  if (result.length === 0) {
    return null;
  }

  // Returning the found document ID
  return result[0].item.id; // This will return the document ID that matches the search
}
