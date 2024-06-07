import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

async function Query(login) {
  const docRef = doc(db, "City", login);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const { Routes } = data;
    const dataArray = [];

    for (const routeId of Routes) {
      const routeDocRef = doc(db, "Routes", routeId);
      const routeDocSnap = await getDoc(routeDocRef);

      if (routeDocSnap.exists()) {
        const routeData = routeDocSnap.data();
        let nbrsessions = routeData.nbrSessions;
        let nbrsessionsannual = routeData.nbrSessionsAnnual;

        if (isNaN(nbrsessionsannual)) {
          nbrsessionsannual = 0;
        } else {    
          nbrsessions = Number(nbrsessions);
          nbrsessionsannual = Number(nbrsessionsannual);
          const factor = 2.5;
          nbrsessions *= factor;
          nbrsessionsannual *= factor;
          nbrsessions = Math.floor(nbrsessions);
          nbrsessionsannual = Math.floor(nbrsessionsannual);
        }
        
        dataArray.push({
          id: routeData.id,
          nameCity: routeData.nameCity,
          nameRoute: routeData.nameRoute,
          nbrSessions: nbrsessions,
          nbrSessionsAnnual: nbrsessionsannual
        });
      }
    }

    dataArray.sort((a, b) => a.id.localeCompare(b.id));
    return dataArray;
  } else {
    console.log("No such document!");
    return [];
  }
}

export { Query };
