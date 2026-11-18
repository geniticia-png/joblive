import { InterventionClient } from './client';

export default function Page({ params }: { params: { id: string } }) {
  return <InterventionClient id={params.id} />;
}
