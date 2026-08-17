import { useState } from "react";
import { api, getApiErrorMessage } from "../api/client";
import { ErrorMessage } from "../components/Feedback";
import { Panel } from "../components/Panel";

export function Assistant() {
  const [question, setQuestion] = useState("Which emission source is highest and what should we reduce first?");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [asking, setAsking] = useState(false);

  async function ask(event) {
    event.preventDefault();
    setError("");
    setAnswer("");
    setAsking(true);
    try {
      const res = await api.post("/assistant/query", { question });
      setAnswer(res.data.answer);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not answer the question"));
    } finally {
      setAsking(false);
    }
  }

  return (
    <Panel title="Conversational emissions assistant">
      <form onSubmit={ask} className="flex gap-2">
        <input className="flex-1 rounded-md border p-2" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button disabled={asking} className="rounded-md bg-leaf px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60">{asking ? "Asking..." : "Ask"}</button>
      </form>
      <div className="mt-4"><ErrorMessage message={error} /></div>
      {answer && <div className="mt-4 rounded-lg bg-mint p-4 text-sm leading-6">{answer}</div>}
    </Panel>
  );
}
