import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getChatById } from "../utils/historyStorage";

import EditorSidebar from "../components/editor/EditorSidebar";
import FloatingPanel from "../components/editor/FloatingPanel";
import PanelTabs from "../components/editor/PanelTabs";

import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Undo2, Redo2,
  Quote, Save
} from "lucide-react";

export default function EditorWorkspace() {

  const location = useLocation();
  const { chatId, messageId } = location.state || {};
    const [sidebarOpen, setSidebarOpen] = useState(true);
const navigate = useNavigate();

  const editorRef = useRef(null);

  const [content, setContent] = useState("");
  const [panels, setPanels] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [currentFont, setCurrentFont] = useState("Calibri");
const [currentSize, setCurrentSize] = useState("3");


  /* LOAD SELECTED MESSAGE */
 useEffect(() => {
  if (!chatId || !messageId) return;

  const chat = getChatById(chatId);
  if (!chat) return;

  const msg = chat.messages.find(
    m => String(m.messageId) === String(messageId)
  );

  if (msg && editorRef.current) {
    editorRef.current.innerHTML = msg.content;
  }
}, [chatId, messageId]);


  /* WORD COMMANDS */
  const exec = (cmd, val=null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
  };

  /* SAVE */
  const handleSave = () => {
  if (!editorRef.current) return;

  const newContent = editorRef.current.innerHTML;

  let history = JSON.parse(localStorage.getItem("creator_chat_history")) || [];

  const chatIndex = history.findIndex(c => c.chatId === chatId);
  if (chatIndex === -1) return;

  const msgIndex = history[chatIndex].messages.findIndex(
    m => String(m.messageId) === String(messageId)
  );

  if (msgIndex === -1) return;

  // update content
  history[chatIndex].messages[msgIndex].content = newContent;
  history[chatIndex].messages[msgIndex].editedAt = Date.now();

  localStorage.setItem("creator_chat_history", JSON.stringify(history));

  // go back to the exact conversation
  navigate(-1);
};


  /* OPEN MESSAGE PANEL */
  const openPanel = (chatId, messageId, content) => {
    setPanels(prev => {
  if (prev.some(p => p.id === messageId)) return prev;
  return [...prev, { id: messageId, title: "Generated Content", content }];
});
  };

  /* MINIMIZE PANEL */
  const minimizePanel = (panel) => {
    setPanels(p => p.filter(x => x.id !== panel.id));
    setTabs(t => [...t, panel]);
  };

  /* RESTORE PANEL */
  const restorePanel = (panel) => {
    setTabs(t => t.filter(x => x.id !== panel.id));
    setPanels(p => [...p, panel]);
  };

  useEffect(() => {
  const editor = editorRef.current;
  if (!editor) return;

  const applyDefaultStyle = () => {
    document.execCommand("fontName", false, currentFont);
    document.execCommand("fontSize", false, currentSize);
  };

  editor.addEventListener("focus", applyDefaultStyle);
  return () => editor.removeEventListener("focus", applyDefaultStyle);
}, [currentFont, currentSize]);

useEffect(() => {
  const editor = editorRef.current;
  if (!editor) return;

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      document.execCommand("insertParagraph");
      e.preventDefault();
    }
  };

  editor.addEventListener("keydown", handleEnter);
  return () => editor.removeEventListener("keydown", handleEnter);
}, []);

useEffect(() => {
  setTimeout(() => {
    editorRef.current?.focus();
  }, 200);
}, []);

  return (
    <div className="h-screen relative text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/editor.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm"/>
      </div>

      <EditorSidebar
  onOpenMessage={openPanel}
  onToggle={(state) => setSidebarOpen(state)}
/>


      {/* TOOLBAR */}
      <div
className={`fixed top-0 right-0 z-20
transition-all duration-300
${sidebarOpen ? "left-[288px]" : "left-[48px]"}
backdrop-blur-xl bg-black/70 border-b border-white/10`}
>

        
        <div className="flex items-center gap-2 p-3">
            {/* FONT FAMILY */}
<select
  className="editor-select"
  title="Font Family"
  onChange={(e)=>{
  const font = e.target.value;
  setCurrentFont(font);
  exec("fontName", font);
  document.execCommand("styleWithCSS", false, true);
}}

>
  <option value="Calibri">Calibri</option>
  <option value="Arial">Arial</option>
  <option value="Times New Roman">Times New Roman</option>
  <option value="Georgia">Georgia</option>
  <option value="Verdana">Verdana</option>
</select>

{/* FONT SIZE */}
<select
  className="editor-select"
  title="Font Size"
  onChange={(e)=>{
  const size = e.target.value;
  setCurrentSize(size);
  exec("fontSize", size);
}}

>
  <option value="2">12</option>
  <option value="3">14</option>
  <option value="4">16</option>
  <option value="5">18</option>
  <option value="6">24</option>
  <option value="7">32</option>
</select>

          {/* TEXT STYLE */}
<button
  onClick={()=>exec("bold")}
  className="toolbar"
  data-tip="Bold — Makes the selected text thicker"
  data-key="Ctrl + B"
>
  <Bold size={16}/>
</button>

<button
  onClick={()=>exec("italic")}
  className="toolbar"
  data-tip="Italic — Slants the selected text"
  data-key="Ctrl + I"
>
  <Italic size={16}/>
</button>

<button
  onClick={()=>exec("underline")}
  className="toolbar"
  data-tip="Underline — Adds a line under text"
  data-key="Ctrl + U"
>
  <Underline size={16}/>
</button>


{/* ALIGNMENT */}
<button
  onClick={()=>exec("justifyLeft")}
  className="toolbar"
  data-tip="Align Left — Align text to left margin"
  data-key="Ctrl + L"
>
  <AlignLeft size={16}/>
</button>

<button
  onClick={()=>exec("justifyCenter")}
  className="toolbar"
  data-tip="Center — Align text to center"
  data-key="Ctrl + E"
>
  <AlignCenter size={16}/>
</button>

<button
  onClick={()=>exec("justifyRight")}
  className="toolbar"
  data-tip="Align Right — Align text to right margin"
  data-key="Ctrl + R"
>
  <AlignRight size={16}/>
</button>


{/* LISTS */}
<button
  onClick={()=>exec("insertUnorderedList")}
  className="toolbar"
  data-tip="Bullet List — Create bullet points"
  data-key="Ctrl + Shift + 8"
>
  <List size={16}/>
</button>

<button
  onClick={()=>exec("insertOrderedList")}
  className="toolbar"
  data-tip="Numbered List — Create numbered list"
  data-key="Ctrl + Shift + 7"
>
  <ListOrdered size={16}/>
</button>


{/* BLOCK */}
<button
  onClick={()=>exec("formatBlock","blockquote")}
  className="toolbar"
  data-tip="Quote — Highlight text as quotation"
  data-key="Ctrl + Shift + Q"
>
  <Quote size={16}/>
</button>


{/* HISTORY */}
<button
  onClick={()=>exec("undo")}
  className="toolbar"
  data-tip="Undo — Revert last change"
  data-key="Ctrl + Z"
>
  <Undo2 size={16}/>
</button>

<button
  onClick={()=>exec("redo")}
  className="toolbar"
  data-tip="Redo — Reapply last undone change"
  data-key="Ctrl + Y"
>
  <Redo2 size={16}/>
</button>


          <div className="ml-auto">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-lg
              bg-gradient-to-r from-purple-600 to-indigo-500 hover:scale-105 transition">
              <Save size={16}/> Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* A4 PAGE */}
<div
className={`absolute right-0 top-16 bottom-10 flex justify-center overflow-auto transition-all duration-300
${sidebarOpen ? "left-[288px]" : "left-[48px]"}`}
>


  <div className="
w-[820px] min-h-[1120px]
bg-white/8
backdrop-blur-3xl
border border-white/20
rounded-2xl
shadow-[0_20px_80px_rgba(0,0,0,0.6)]
p-14 outline-none
text-white
leading-relaxed
caret-white
"
>

    {/* GLASS PAPER BACKGROUND */}
    <div className="
      absolute inset-0
      bg-white/12
      backdrop-blur-3xl
      border border-white/25
      shadow-[0_25px_80px_rgba(0,0,0,0.65)]
      rounded-xl
    "/>

    {/* ACTUAL EDITABLE TEXT LAYER */}
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      className="
      relative
      w-full min-h-[1120px]
      p-[70px]
      outline-none
      text-[17px]
      leading-8
      text-white
      caret-purple-400
      selection:bg-purple-500/40
      font-[Calibri,Arial]
      "
    />
  </div>
</div>


      {/* FLOATING PANELS */}
      {panels.map(panel => (
        <FloatingPanel
          key={panel.id}
          title={panel.title}
          content={panel.content}
          onClose={() => setPanels(p => p.filter(x=>x.id!==panel.id))}
          onMinimize={() => minimizePanel(panel)}
        />
      ))}

      {/* BOTTOM TABS */}
      <PanelTabs tabs={tabs} onRestore={restorePanel} />

      <style>{`

.toolbar{
  padding:7px 11px;
  border-radius:8px;
  border:1px solid rgba(255,255,255,0.15);
  background:rgba(255,255,255,0.02);
  transition:all .18s ease;
}
.toolbar:hover{
  background:linear-gradient(135deg, rgba(139,92,246,.45), rgba(99,102,241,.45));
  transform:translateY(-1px);
  box-shadow:0 6px 18px rgba(139,92,246,.35);
}
.toolbar:active{
  transform:scale(.95);
}

/* PROFESSIONAL WORD TOOLTIP */
.toolbar:hover::after{
  content: attr(data-tip) "   [" attr(data-key) "]";
  position:absolute;
  bottom:-40px;
  left:50%;
  transform:translateX(-50%);
  background:#0f0f12;
  border:1px solid rgba(255,255,255,.15);
  color:#fff;
  padding:7px 11px;
  font-size:12px;
  border-radius:7px;
  white-space:nowrap;
  box-shadow:0 12px 30px rgba(0,0,0,.55);
  pointer-events:none;
  z-index:100;
  opacity:1;
}

/* small arrow */
.toolbar:hover::before{
  content:"";
  position:absolute;
  bottom:-8px;
  left:50%;
  transform:translateX(-50%);
  border-width:6px;
  border-style:solid;
  border-color:#0f0f12 transparent transparent transparent;
}
      .editor-select{
  background: rgba(0,0,0,.35);
  border:1px solid rgba(255,255,255,.15);
  color:white;
  padding:6px 10px;
  border-radius:8px;
  outline:none;
}
.editor-select:hover{
  background: rgba(139,92,246,.25);
}
`}</style>

    </div>
  );
}
