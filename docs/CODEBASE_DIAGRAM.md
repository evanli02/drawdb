# DrawDB Codebase Diagram

A React + Vite app for designing database ER diagrams. Below are architecture and structure diagrams.

---

## 1. Entry & routing

```mermaid
flowchart TB
  subgraph entry["Entry (main.jsx)"]
    LocaleProvider["LocaleProvider (Semi UI)"]
    App["App.jsx"]
    Analytics["Vercel Analytics"]
    LocaleProvider --> App
    App --> Analytics
  end

  subgraph app["App (SettingsContext)"]
    Router["BrowserRouter"]
    Routes["Routes"]
    Router --> Routes
  end

  subgraph routes["Routes"]
    R1["/ → LandingPage"]
    R2["/editor → Editor"]
    R3["/editor/diagrams/:id → Editor"]
    R4["/editor/templates/:id → Editor"]
    R5["/bug-report → BugReport"]
    R6["/templates → Templates"]
    R7["* → NotFound"]
  end

  entry --> app
  Routes --> R1 & R2 & R3 & R4 & R5 & R6 & R7
```

---

## 2. Editor context stack (innermost = closest to UI)

Context providers wrap the editor; order matters for dependencies.

```mermaid
flowchart LR
  subgraph outer["Outer (layout & transform)"]
    LayoutContext["LayoutContext"]
    TransformContext["TransformContext"]
  end

  subgraph state["State & history"]
    UndoRedoContext["UndoRedoContext"]
    SelectContext["SelectContext"]
  end

  subgraph domain["Domain (diagram entities)"]
    AreasContext["AreasContext"]
    NotesContext["NotesContext"]
    TypesContext["TypesContext"]
    EnumsContext["EnumsContext"]
    DiagramContext["DiagramContext\n(tables, relationships, DB)"]
  end

  subgraph persistence["Persistence"]
    SaveStateContext["SaveStateContext"]
  end

  subgraph ui["UI"]
    WorkSpace["WorkSpace"]
  end

  LayoutContext --> TransformContext --> UndoRedoContext --> SelectContext
  SelectContext --> AreasContext --> NotesContext --> TypesContext --> EnumsContext
  EnumsContext --> DiagramContext --> SaveStateContext --> WorkSpace
```

---

## 3. Workspace composition

```mermaid
flowchart TB
  subgraph workspace["WorkSpace"]
    direction TB
    ControlPanel["ControlPanel\n(EditorHeader)"]
    CanvasArea["Canvas area"]
    SidePanel["SidePanel\n(resizable)"]
    FloatingControls["FloatingControls"]

    ControlPanel
    CanvasArea
    SidePanel
    FloatingControls
  end

  subgraph canvas_area["Canvas area"]
    CanvasContextProvider["CanvasContextProvider"]
    Canvas["Canvas\n(tables, relationships, notes, areas)"]
    CanvasContextProvider --> Canvas
  end

  subgraph control_panel["ControlPanel (EditorHeader)"]
    LayoutDropdown["LayoutDropdown"]
    Modals["Modals: Open, Share, Import, Export, Rename, etc."]
    SideSheets["SideSheets: Timeline, Migration"]
  end

  subgraph side_panel["SidePanel"]
    Tabs["Tabs"]
    DBMLEditor["DBMLEditor (Monaco)"]
    Issues["Issues"]
    Tabs --> TablesTab["TablesTab"]
    Tabs --> RelationshipsTab["RelationshipsTab"]
    Tabs --> AreasTab["AreasTab"]
    Tabs --> NotesTab["NotesTab"]
    Tabs --> TypesTab["TypesTab"]
    Tabs --> EnumsTab["EnumsTab"]
  end

  workspace ~~~ canvas_area
  workspace ~~~ control_panel
  workspace ~~~ side_panel
```

---

## 4. Data & external layers

```mermaid
flowchart LR
  subgraph ui_layer["UI layer"]
    Pages["Pages"]
    Components["Components"]
    Hooks["Hooks"]
    Context["Contexts"]
  end

  subgraph data_layer["Data layer"]
    db["db (Dexie)\ndiagrams, templates"]
    constants["data/constants"]
    databases["data/databases"]
    schemas["data/schemas"]
    seeds["data/seeds"]
  end

  subgraph api_layer["API layer"]
    gists["api/gists\n(create, patch, get, compare)"]
    email["api/email\n(send)"]
  end

  subgraph utils_layer["Utils layer"]
    importSQL["utils/importSQL\n(MySQL, Postgres, SQLite, etc.)"]
    exportSQL["utils/exportSQL"]
    importFrom["utils/importFrom\n(DBML)"]
    exportAs["utils/exportAs\n(DBML, Mermaid)"]
    migrations["utils/migrations\n(diffToSQL)"]
    arrangeTables["utils/arrangeTables"]
    validateSchema["utils/validateSchema"]
  end

  subgraph i18n["i18n"]
    i18n_config["i18n.js"]
    locales["locales (en, zh, jp, …)"]
  end

  Context --> Hooks
  Components --> Context
  Pages --> Components
  Hooks --> data_layer
  Hooks --> utils_layer
  Components --> api_layer
  Components --> i18n
  data_layer --> db
```

---

## 5. Hooks ↔ contexts

```mermaid
flowchart LR
  subgraph hooks["Hooks (src/hooks)"]
    useAreas
    useCanvas
    useDiagram
    useEnums
    useFullscreen
    useLayout
    useNotes
    useSaveState
    useSelect
    useSettings
    useTransform
    useTypes
    useUndoRedo
    useThemedPage
  end

  subgraph contexts["Contexts"]
    AreasContext
    CanvasContext
    DiagramContext
    EnumsContext
    LayoutContext
    NotesContext
    SaveStateContext
    SelectContext
    SettingsContext
    TransformContext
    TypesContext
    UndoRedoContext
  end

  useAreas --> AreasContext
  useCanvas --> CanvasContext
  useDiagram --> DiagramContext
  useEnums --> EnumsContext
  useLayout --> LayoutContext
  useNotes --> NotesContext
  useSaveState --> SaveStateContext
  useSelect --> SelectContext
  useSettings --> SettingsContext
  useTransform --> TransformContext
  useTypes --> TypesContext
  useUndoRedo --> UndoRedoContext
```

---

## 6. Directory tree (main areas)

```
src/
├── main.jsx              # Entry: LocaleProvider, App, Analytics
├── App.jsx                # SettingsContext, Router, Routes
├── index.css
├── pages/                 # Route targets
│   ├── Editor.jsx         # Context stack + WorkSpace
│   ├── LandingPage.jsx
│   ├── Templates.jsx
│   ├── BugReport.jsx
│   └── NotFound.jsx
├── context/               # React contexts (see diagram 2)
├── hooks/                 # useDiagram, useCanvas, useLayout, …
├── components/
│   ├── Workspace.jsx      # ControlPanel, Canvas, SidePanel, FloatingControls
│   ├── EditorHeader/      # ControlPanel, Modals, SideSheets, LayoutDropdown
│   ├── EditorCanvas/      # Canvas, Relationship, Table, Note, Area
│   ├── EditorSidePanel/   # SidePanel, Tabs, DBMLEditor, Issues
│   ├── LexicalEditor/     # RichEditor, ToolbarPlugin, plugins
│   ├── CodeEditor/       # Monaco + DBML setup
│   └── SortableList/      # DnD list
├── data/                  # db (Dexie), constants, databases, schemas, seeds
├── api/                   # gists, email
├── utils/                 # importSQL, exportSQL, importFrom, exportAs, migrations, …
├── i18n/                  # i18n.js, locales/
├── templates/             # template1..6, seeds
├── animations/
├── icons/
└── assets/
```

---

## Summary

| Layer        | Purpose |
|-------------|---------|
| **App**     | Settings, router, route definitions. |
| **Editor**  | Nested contexts for layout, transform, undo/redo, selection, areas, notes, types, enums, diagram (tables/relationships), save state. |
| **WorkSpace** | Header (ControlPanel), canvas (Canvas + CanvasContext), resizable SidePanel (tabs + DBML editor), floating controls. |
| **Data**    | Dexie DB (diagrams, templates), constants, DB configs, JSON schemas. |
| **API**     | GitHub Gists (create/patch/get/compare), email. |
| **Utils**   | SQL import/export per dialect, DBML/Mermaid, migrations, validation, layout (arrangeTables). |
| **i18n**    | react-i18next + many locales. |
