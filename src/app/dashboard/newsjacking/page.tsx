import { Metadata } from "next";
import { NewsjackingClient } from "./NewsjackingClient";

export const metadata: Metadata = {
  title: "Regulatory Newsjacking & Enforcement Bulletins | Paylit Dashboard",
  description: "Monitor active state labor department penalties and generate viral executive LinkedIn posts.",
};

export default function NewsjackingPage() {
  return <NewsjackingClient />;
}
