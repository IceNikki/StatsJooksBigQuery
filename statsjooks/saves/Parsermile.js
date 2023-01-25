import * as xlsx from "xlsx";
readUploadFile = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet);
        //json includes csv data
        this.uploadedPOI = json
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  }

//----------- FIND Last ID of a collection & pending collection
export const fetchNewId = async (collectionName) => {
    let Index = 0;
    let indexPending = 0;
    let indexDeployed = 0;
    await db
        .collection(collectionName)
        .orderBy("Index", "desc")
        .limit(1)
        .get()
        .then(async (snapshot) => {
            snapshot.forEach(async (doc) => {
                indexDeployed = doc.data().Index + 1;
            });
        });
    await db
        .collection(collectionName + "_Pending")
        .orderBy("Index", "desc")
        .limit(1)
        .get()
        .then(async (snapshot) => {
            snapshot.forEach(async (doc) => {
                indexPending = doc.data().Index + 1;
            });
        });
    indexDeployed > indexPending
        ? (Index = indexDeployed)
        : (Index = indexPending);
    return Index;
};

export const CreateNewPoisFromFile = (uploadedPOI, idCity) => {
    return async (dispatch, getState) => {
        let Index = await fetchNewId("POI");
        for (let element of uploadedPOI) {
            console.log(element)
            element["idCity"] = idCity;
            element["idPOI"] = `PO${Index}`;
            let data = {
                AudioActivated: true,
                Checked: {},
                Description: {
                    "FR": element.Description
                    //we can add other laguage
                },
                GPS: [{
                    0: {
                        //change to int
                        Latitude: parseFloat(element.Latitude),
                        Longitude: parseFloat(element.Longitude)
                    }
                }],
                IdCity: element.idCity,
                Index: Index,
                IsAutoDirectionActivated: true,
                IsBloquant: false,
                IsDirectionnal: false,
                IsInvisible: false,
                MP3: {},
                Name: {
                    "FR": element.Nom
                },
                POIRunFreely: false,
                Range: 15,
                Route: [],
                Vocal: {},
                Status: 1,
                idCategoryPOI: [],
                //labelCategoryPOI: [],
            }
            console.log(data)
            await db
                .collection("POI_Pending")
                .doc(`PO${Index}`)
                .set(data);
            await saveInSupabase('poi', data, `PO${Index}`)
            Index++
        }
    }
}