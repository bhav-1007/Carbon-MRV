import { useState } from "react";
import { api } from "../api/client";
import { Panel } from "../components/Panel";

export function Assistant() {
  const [question, setQuestion] = useState("Which scope is highest and what should we reduce first?");
  const [answer, setAnswer] = useState("");

  async function ask(event) {
    event.preventDefault();
    const res = await api.post("/assistant/query", { question });
    setAnswer(res.data.answer);
  }

  return (
    <Panel title="Conversational emissions assistant">
      <form onSubmit={ask} className="flex gap-2">
        <input className="flex-1 rounded-md border p-2" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button className="rounded-md bg-leaf px-4 py-2 text-white">Ask</button>
      </form>
      {answer && <div className="mt-4 rounded-lg bg-mint p-4 text-sm leading-6">{answer}</div>}
    </Panel>
  );
}
