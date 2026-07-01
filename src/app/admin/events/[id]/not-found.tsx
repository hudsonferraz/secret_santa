import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminEventNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Evento não encontrado</CardTitle>
          <CardDescription>
            O evento que você procurou não existe ou foi removido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/admin/events">Voltar aos eventos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
