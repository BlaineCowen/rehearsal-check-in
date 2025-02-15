import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Group = {
  id: string;
  name: string;
};

export default function AdminDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from("groups").select("*");

      if (!error) setGroups(data as any);
    };
    fetchGroups();
  }, []);

  const createRehearsal = async () => {
    const { data, error } = await supabase.from("rehearsals").insert({
      group_id: selectedGroups,
      share_link: crypto.randomUUID(),
    });

    if (!error) {
      // Show share link to admin
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Create New Rehearsal</h2>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {groups.map((group) => (
          <div key={group.id} className="p-4 border rounded">
            <input
              type="checkbox"
              checked={selectedGroups.includes(group.id)}
              onChange={(e) =>
                setSelectedGroups(
                  e.target.checked
                    ? [...selectedGroups, group.id]
                    : selectedGroups.filter((id) => id !== group.id)
                )
              }
            />
            <h3 className="text-xl">{group.name}</h3>
          </div>
        ))}
      </div>
      <button
        onClick={createRehearsal}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Rehearsal Link
      </button>
    </div>
  );
}
