interface Data {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: null | string;
  date_start: number;
  date_end: number;
}

import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";

function App() {
  const [allData, setAllData] = useState<Data[]>([]);
  const [page, setPage] = useState(1);
  const totalPages = 10875;
  const [selectedRow, setSelectedRow] = useState<Data[] | null>([]);
  const [selectedRowId, setSelectedRowId] = useState<number[]>([]);

  
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}`
        );
        const data = await response.json();
        setAllData(data.data);
      } catch (error) {
        console.error("Error is:", error);
      }
    };
    
    getData();
  }, [page]);
  
  useEffect(() => {
    const getData = localStorage.getItem('selectionID') || '[]';
    if (getData) {
      const ID = JSON.parse(getData);
      setSelectedRowId(ID);
    }
  }, [])

  useEffect(() => {
  if (selectedRowId.length > 0 && allData.length > 0) {
    const restoredData = allData.filter((data) => selectedRowId.includes(data.id));
    setSelectedRow(restoredData);
  }
}, [allData]); // Run when data is fetched

  return (
    <>
      <DataTable
        value={allData}
        dataKey="id"
        selection={selectedRow}
        onSelectionChange={(e) => {
          setSelectedRow(e.value as Data[]);
          const getRowId = e.value.map((row) => {
            setSelectedRowId(row.id);
          })
          localStorage.setItem('selectionID', JSON.stringify(getRowId));
        }}
        paginator
        rows={12}
        lazy
        totalRecords={totalPages}
        first={(page - 1) * 12}
        onPage={(e) => setPage(e.page + 1)} 
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        <Column field="title" header="TITLE" />
        <Column field="place_of_origin" header="PLACE OF ORIGIN" />
        <Column field="artist_display" header="ARTIST" />
        <Column field="inscriptions" header="INSCRIPTIONS" />
        <Column field="date_start" header="START DATE" />
        <Column field="date_end" header="END DATE" />
      </DataTable>
    </>
  );
}

export default App;
