import { useParams } from "react-router-dom"

export function CustomerProfilePage() {
  const { id } = useParams()
  return <h1 className="text-lg font-medium text-foreground">Customer {id}</h1>
}