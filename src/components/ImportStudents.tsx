"use client";

import { useState } from "react";
import { importStudents } from "@/app/actions";

export default function ImportStudents() {
  const [csvData, setCsvData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await importStudents(csvData);
      setCsvData("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold mb-4">Import Students</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">
            Paste CSV Data (format: firstName,lastName,studentId,grade)
          </label>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            className="w-full p-2 border rounded h-48"
            placeholder={`John,Doe,12345,9\nJane,Smith,67890,10`}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50 hover:bg-blue-600"
        >
          {isSubmitting ? "Importing..." : "Import Students"}
        </button>
      </form>
    </div>
  );
}
