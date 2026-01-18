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
import { IoIosArrowDown } from "react-icons/io";

function App() {
  const [allData, setAllData] = useState<Data[]>([]);
  const [page, setPage] = useState(1);
  const totalPages = 10875;
  const [selectedRowId, setSelectedRowId] = useState<number[]>(() => {
    return JSON.parse(localStorage.getItem("selectionID") || "[]");
  });
  const [targetSelectionCount, setTargetSelectionCount] = useState<number>(
    () => {
      return JSON.parse(localStorage.getItem("targetSelectionCount") || "0");
    },
  );
  const selectedRow = allData.filter((row) => selectedRowId.includes(row.id));
  const [showCustomRowSelection, setShowCustomRowSelection] = useState(false);
  const [numberOfSelection, setNumberOfSelection] = useState<number | "">("");

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}`,
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
    localStorage.setItem("selectionID", JSON.stringify(selectedRowId));
  }, [selectedRowId]);

  const handleSelect = () => {
    setSelectedRowId((prev) => {
      if (!numberOfSelection || numberOfSelection < 0) return prev;

      if (numberOfSelection <= prev.length) {
        setTargetSelectionCount(0);
        localStorage.setItem("targetSelectionCount", JSON.stringify(0));
        return prev.slice(0, numberOfSelection);
      }

      const needed = numberOfSelection - prev.length;
      const availableOnCurrentPage = allData
        .filter((row) => !prev.includes(row.id))
        .slice(0, needed)
        .map((row) => row.id);

      const remainingNeeded = needed - availableOnCurrentPage.length;
      setTargetSelectionCount(remainingNeeded);
      localStorage.setItem(
        "targetSelectionCount",
        JSON.stringify(remainingNeeded),
      );

      return [...prev, ...availableOnCurrentPage];
    });
    setShowCustomRowSelection(false);
    setNumberOfSelection("");
  };

  useEffect(() => {
    if (targetSelectionCount > 0) {
      setSelectedRowId((prev) => {
        const newIds = allData
          .filter((row) => !prev.includes(row.id))
          .slice(0, targetSelectionCount)
          .map((row) => row.id);
        
        if (newIds.length > 0) {
          const remainingNeeded = targetSelectionCount - newIds.length;
          setTargetSelectionCount(remainingNeeded);
          localStorage.setItem('targetSelectionCount', JSON.stringify(remainingNeeded));
        }

        return [...prev, ...newIds];
      });
    }
  }, [allData, targetSelectionCount]);

  return (
    <>
      <div className="ms-3 mt-2 mb-5">
        Selected:{" "}
        <strong className="text-blue-400">
          {targetSelectionCount > 0
            ? selectedRowId.length + targetSelectionCount
            : selectedRowId.length}
        </strong>{" "}
        rows{" "}
      </div>

      <div
        className={`custom-row-selection-section relative ${
          showCustomRowSelection ? "block" : "hidden"
        }`}
      >
        <div className="box z-10 absolute top-15 left-11 w-100 p-5 px-4 border border-gray-300 rounded-2xl shadow-lg bg-white">
          <span>Select Multiple Rows</span>
          <p className="mt-2 text-sm">
            Enter number of rows to select across all pages
          </p>
          <div className="mt-3 flex items-center justify-between">
            <input
              type="number"
              placeholder="e.g. 20"
              className="placeholder:ms-2 w-70 border border-gray-400 rounded-md p-1.5"
              value={numberOfSelection}
              onChange={(e) =>
                setNumberOfSelection(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
            <button
              onClick={handleSelect}
              className="px-3 py-1.5 cursor-pointer rounded-md text-white bg-[#606ec0] hover:bg-[#606ec0b7]"
            >
              Select
            </button>
          </div>
        </div>
      </div>

      <DataTable
        value={allData}
        dataKey="id"
        selection={selectedRow}
        onSelectionChange={(e) => {
          const pageSelectedIds = e.value.map((r: Data) => r.id);

          setSelectedRowId((prev) => {
            const filteredPrev = prev.filter(
              (id) => !allData.some((row) => row.id === id),
            );
            return [...filteredPrev, ...pageSelectedIds];
          });
        }}
        selectionMode="multiple"
        paginator
        rows={12}
        lazy
        totalRecords={totalPages}
        first={(page - 1) * 12}
        onPage={(e) => setPage((e.page ?? 0) + 1)}
      >
        <Column
          selectionMode="multiple"
          header={
            <div className="relative">
              <IoIosArrowDown
                onClick={() =>
                  setShowCustomRowSelection(!showCustomRowSelection)
                }
                className="absolute -top-2 left-7 z-10 cursor-pointer text-gray-400 text-lg"
              />
            </div>
          }
          headerStyle={{ width: "3rem" }}
        />

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
