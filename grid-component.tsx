"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type GridData = {
  id: string
  firstName: string
  lastName: string
}

export default function GridComponent() {
  const [data, setData] = useState<GridData[]>([
    { id: "1", firstName: "John", lastName: "Doe" },
    { id: "2", firstName: "Jane", lastName: "Smith" },
  ])

  const [newRow, setNewRow] = useState<GridData>({ id: "", firstName: "", lastName: "" })
  const [csvInput, setCsvInput] = useState("")
  const newRowRef = useRef<HTMLTableRowElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewRow((prev) => ({ ...prev, [name]: value }))
  }

  const addNewRow = () => {
    if (newRow.id && newRow.firstName && newRow.lastName) {
      setData((prev) => [...prev, newRow])
      setNewRow({ id: "", firstName: "", lastName: "" })
      if (newRowRef.current) {
        newRowRef.current.querySelector("input")?.focus()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addNewRow()
    }
  }

  const handleCsvPaste = () => {
    const rows = csvInput.split("\n")
    const newData = rows
      .map((row) => {
        const [firstName, lastName, id] = row.split(",")
        return { id: id?.trim(), firstName: firstName?.trim(), lastName: lastName?.trim() }
      })
      .filter((row) => row.id && row.firstName && row.lastName)

    setData((prev) => [...prev, ...newData])
    setCsvInput("")
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Grid Component</h1>

      <div className="overflow-x-auto border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>{row.id}</TableCell>
              </TableRow>
            ))}
            <TableRow ref={newRowRef} className="bg-muted/50">
              <TableCell>
                <Input
                  placeholder="First Name"
                  name="firstName"
                  value={newRow.firstName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Last Name"
                  name="lastName"
                  value={newRow.lastName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="ID"
                  name="id"
                  value={newRow.id}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2">
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Paste CSV data here (format: FirstName, LastName, ID)"
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
        ></textarea>
        <Button onClick={handleCsvPaste}>Append CSV Data</Button>
      </div>
    </div>
  )
}

