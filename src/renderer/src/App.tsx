import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { replaceAllText, setUtteranceText } from "../../shared/transcript";
import type {
  ProjectSummary,
  TranscribePhase,
  Transcript,
  Utterance,
} from "../../shared/types";
import DropZone from "./components/DropZone";
import ProjectHistory from "./components/ProjectHistory";
import SettingsPage from "./components/SettingsPage";
import SubtitleList from "./components/SubtitleList";
import VideoPlayer from "./components/VideoPlayer";

type View = "workbench" | "settings";

type WorkbenchState =
  | { kind: "idle" }
  | { kind: "working"; videoPath: string; phase: TranscribePhase }
  | { kind: "ready"; transcript: Transcript; mediaUrl: string }
  | {
      kind: "error";
      videoPath: string;
      message: string;
      apiKeyProblem: boolean;
    };

function describePhase(phase: TranscribePhase): string {
  return phase === "extracting" ? "Extracting audio…" : "Transcribing…";
}

function findActiveUtterance(
  utterances: Utterance[],
  timeMs: number,
): string | null {
  const active = utterances.find(
    (utterance) => timeMs >= utterance.start && timeMs < utterance.end,
  );
  return active ? active.id : null;
}

function stripIpcErrorPrefix(message: string): string {
  return message.replace(/^Error invoking remote method '[^']+': Error: /, "");
}

const buttonClass =
  "cursor-pointer rounded-md border border-black/25 px-3 py-1.5 text-sm dark:border-white/25";
const inputClass =
  "rounded-md border border-black/25 bg-transparent px-2 py-1 text-sm dark:border-white/25";

export default function App(): JSX.Element {
  const [view, setView] = useState<View>("workbench");
  const [state, setState] = useState<WorkbenchState>({ kind: "idle" });
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeUtteranceId, setActiveUtteranceId] = useState<string | null>(
    null,
  );
  const [exportMessage, setExportMessage] = useState("");
  const [undoSnapshot, setUndoSnapshot] = useState<Transcript | null>(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replaceMessage, setReplaceMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return window.auteo.onTranscribeProgress((progress) => {
      setState((current) =>
        current.kind === "working"
          ? { ...current, phase: progress.phase }
          : current,
      );
    });
  }, []);

  const refreshProjects = useCallback(async () => {
    setProjects(await window.auteo.listProjects());
  }, []);

  useEffect(() => {
    if (view === "workbench" && state.kind === "idle") void refreshProjects();
  }, [view, state.kind, refreshProjects]);

  const resetEditingState = (): void => {
    setUndoSnapshot(null);
    setFindText("");
    setReplaceText("");
    setReplaceMessage("");
    setExportMessage("");
  };

  const transcribe = async (
    videoPath: string,
    force = false,
  ): Promise<void> => {
    setState({ kind: "working", videoPath, phase: "extracting" });
    setActiveUtteranceId(null);
    resetEditingState();
    try {
      const transcript = await window.auteo.transcribeVideo(videoPath, force);
      const mediaUrl = await window.auteo.registerMedia(videoPath);
      setState({ kind: "ready", transcript, mediaUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setState({
        kind: "error",
        videoPath,
        message: stripIpcErrorPrefix(message),
        apiKeyProblem: message.includes("API_KEY_"),
      });
    }
  };

  const openProject = async (id: string): Promise<void> => {
    setActiveUtteranceId(null);
    resetEditingState();
    try {
      const result = await window.auteo.openProject(id);
      setState({
        kind: "ready",
        transcript: result.transcript,
        mediaUrl: result.mediaUrl,
      });
      if (result.stale) {
        setReplaceMessage("Video file has changed — consider Re-transcribe.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setReplaceMessage(stripIpcErrorPrefix(message));
      await refreshProjects();
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    await window.auteo.deleteProject(id);
    await refreshProjects();
  };

  const seekTo = (utterance: Utterance): void => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = utterance.start / 1000;
    void video.play();
  };

  const applyTranscript = (previous: Transcript, next: Transcript): void => {
    setUndoSnapshot(previous);
    setState((current) =>
      current.kind === "ready" ? { ...current, transcript: next } : current,
    );
    void window.auteo.saveProject(next);
  };

  const handleEditSave = (id: string, text: string): void => {
    if (state.kind !== "ready") return;
    setReplaceMessage("");
    applyTranscript(
      state.transcript,
      setUtteranceText(state.transcript, id, text),
    );
  };

  const handleReplaceAll = (): void => {
    if (state.kind !== "ready") return;
    const { transcript, count } = replaceAllText(
      state.transcript,
      findText,
      replaceText,
    );
    if (count === 0) {
      setReplaceMessage("No matches.");
      return;
    }
    setReplaceMessage(`Replaced ${count} occurrence${count === 1 ? "" : "s"}.`);
    applyTranscript(state.transcript, transcript);
  };

  const handleUndo = (): void => {
    if (state.kind !== "ready" || undoSnapshot === null) return;
    const restored = undoSnapshot;
    setUndoSnapshot(null);
    setReplaceMessage("Undone.");
    setState((current) =>
      current.kind === "ready" ? { ...current, transcript: restored } : current,
    );
    void window.auteo.saveProject(restored);
  };

  const exportSrt = async (transcript: Transcript): Promise<void> => {
    setExportMessage("");
    try {
      const result = await window.auteo.exportSrt(transcript);
      if (result.savedPath) setExportMessage(`Saved to ${result.savedPath}`);
    } catch (error) {
      setExportMessage(
        error instanceof Error ? error.message : "Export failed.",
      );
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-black/15 px-4 py-2.5 dark:border-white/15">
        <span className="text-base font-bold">Auteo</span>
        <nav className="flex gap-2">
          <button
            className={`${buttonClass} ${view === "workbench" ? "bg-black/10 dark:bg-white/10" : ""}`}
            onClick={() => setView("workbench")}
          >
            Workbench
          </button>
          <button
            className={`${buttonClass} ${view === "settings" ? "bg-black/10 dark:bg-white/10" : ""}`}
            onClick={() => setView("settings")}
          >
            Settings
          </button>
        </nav>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        {view === "settings" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
            <SettingsPage />
          </div>
        ) : state.kind === "idle" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
            <DropZone onSelect={(videoPath) => void transcribe(videoPath)} />
            {replaceMessage !== "" && (
              <p className="mt-2 mb-0 text-xs text-red-500">{replaceMessage}</p>
            )}
            <ProjectHistory
              projects={projects}
              onOpen={(id) => void openProject(id)}
              onDelete={(id) => void deleteProject(id)}
            />
          </div>
        ) : state.kind === "working" ? (
          <div className="m-auto flex flex-col items-center gap-2">
            <p className="font-mono text-xs break-all opacity-80">
              {state.videoPath}
            </p>
            <p>{describePhase(state.phase)}</p>
          </div>
        ) : state.kind === "error" ? (
          <div className="m-auto flex flex-col items-center gap-2">
            <p className="max-w-2xl text-center text-red-500">
              {state.message}
            </p>
            <div className="flex gap-2">
              {state.apiKeyProblem && (
                <button
                  className={buttonClass}
                  onClick={() => setView("settings")}
                >
                  Open Settings
                </button>
              )}
              <button
                className={buttonClass}
                onClick={() => void transcribe(state.videoPath)}
              >
                Retry
              </button>
              <button
                className={buttonClass}
                onClick={() => setState({ kind: "idle" })}
              >
                Choose another video
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <VideoPlayer
                ref={videoRef}
                src={state.mediaUrl}
                onTimeUpdate={(timeMs) =>
                  setActiveUtteranceId(
                    findActiveUtterance(state.transcript.utterances, timeMs),
                  )
                }
              />
              <div className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between text-[13px] opacity-85">
                  <span>
                    {state.transcript.utterances.length} utterances ·{" "}
                    {Math.round(state.transcript.audioDurationMs / 1000)}s
                  </span>
                  <div className="flex gap-2">
                    <button
                      className={buttonClass}
                      onClick={() => void exportSrt(state.transcript)}
                    >
                      Export SRT
                    </button>
                    <button
                      className={buttonClass}
                      onClick={() =>
                        void transcribe(state.transcript.sourcePath, true)
                      }
                    >
                      Re-transcribe
                    </button>
                    <button
                      className={buttonClass}
                      onClick={() => setState({ kind: "idle" })}
                    >
                      Choose another video
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className={`${inputClass} w-40`}
                    placeholder="Find"
                    value={findText}
                    onChange={(event) => setFindText(event.target.value)}
                  />
                  <input
                    className={`${inputClass} w-40`}
                    placeholder="Replace with"
                    value={replaceText}
                    onChange={(event) => setReplaceText(event.target.value)}
                  />
                  <button
                    className={`${buttonClass} disabled:cursor-default disabled:opacity-50`}
                    disabled={findText === ""}
                    onClick={handleReplaceAll}
                  >
                    Replace All
                  </button>
                  {undoSnapshot !== null && (
                    <button className={buttonClass} onClick={handleUndo}>
                      Undo
                    </button>
                  )}
                  {replaceMessage !== "" && (
                    <span className="text-xs opacity-70">{replaceMessage}</span>
                  )}
                </div>
                {exportMessage !== "" && (
                  <p className="m-0 text-xs break-all opacity-70">
                    {exportMessage}
                  </p>
                )}
              </div>
            </div>
            <SubtitleList
              utterances={state.transcript.utterances}
              activeId={activeUtteranceId}
              onSelect={seekTo}
              onEditSave={handleEditSave}
            />
          </div>
        )}
      </main>
    </div>
  );
}
