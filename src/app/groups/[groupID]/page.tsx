import EditGroup from "@/components/EditGroup";
import SelectableStudentTable from "@/components/SelectableStudentTable";
import { Checkbox } from "@/components/ui/checkbox";
export default async function GroupPage({
  params,
}: {
  params: { groupId: string };
}) {
  const { groupId } = await params;
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <EditGroup groupId={params.groupId} />
      </div>
    </div>
  );
}
