import { createContext, useState } from "react";

export const PromptContext = createContext();

export function PromptProvider({ children }) {

  // the real LLM prompt
  const [finalPrompt, setFinalPrompt] = useState("");

  // what user edits in panel
  const [editablePrompt, setEditablePrompt] = useState("");

  // panel open
  const [promptPanelOpen, setPromptPanelOpen] = useState(false);

  // if user saved custom prompt
  const [hasCustomPrompt, setHasCustomPrompt] = useState(false);
const resetPromptPanel = () => {
  setEditablePrompt("");
  setFinalPrompt("");
  setHasCustomPrompt(false);
};

  return (
    <PromptContext.Provider value={{
  finalPrompt,
  setFinalPrompt,
  editablePrompt,
  setEditablePrompt,
  promptPanelOpen,
  setPromptPanelOpen,
  hasCustomPrompt,
  setHasCustomPrompt,
  resetPromptPanel
}}>
      {children}
    </PromptContext.Provider>
  );
}
