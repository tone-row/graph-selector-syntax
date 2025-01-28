import { PlaygroundState } from "@/components/PlaygroundState";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initialValue = searchParams.code
    ? decodeURIComponent(searchParams.code as string)
    : undefined;

  return (
    <div className="min-h-screen p-12 grid gap-3 content-start">
      <h1 className="text-3xl font-bold">Playground</h1>
      <PlaygroundState initialValue={initialValue} />
    </div>
  );
}
