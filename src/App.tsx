interface Data{
  title: string;
  placeOfOrigin: string;
  artist: string;
  inscription: null | string;
  startingDate: string;
  endDate: string;
}

import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useState } from "react";

function App() {

  const [allData, setAllData] = useState<Data[]>([]);
  const [page, setPage] = useState(1);

  const getData = async () => {
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data = await response.json();
      setAllData(data.data);
    }
    catch (error) {
      console.error("Error is:", error);
    }
  }

  getData();
  return (
    <>
      <DataTable>
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        <Column field="title" header="TITLE" />
        <Column field="place of origin" header="PLACE OF ORIGIN" />
        <Column field="artist" header="ARTIST" />
        <Column field="inscriptions" header="INSCRIPTIONS" />
        <Column field="start date" header="START DATE" />
        <Column field="end date" header="END DATE" />
      </DataTable>
    </>
  );
}

export default App;
