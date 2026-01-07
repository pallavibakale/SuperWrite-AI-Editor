import React from "react";
import { EditorView } from "prosemirror-view";
import { undo } from "prosemirror-history";
import {
  markActive,
  toggleBold,
  toggleH1,
  toggleH2,
  toggleItalic,
  toggleUnderline,
  toggleComment,
  toggleParagraph,
  toggleLink,
} from "../editor/editorSetup";
import { performRewrite } from "../editor/aiActions";
import { getSelectionInfo } from "../editor/selectionUtils";
import { RewriteIntent } from "../types";
import {
  Heading1,
  Heading2,
  MessageSquarePlus,
  Sparkles,
  Type,
  Loader2,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  Link2,
  ChevronDown,
} from "lucide-react";
import { clsx } from "clsx";

interface ToolbarProps {
  view: EditorView | null;
  editorStateHash: number; // Used to force re-render when editor state changes
}

export const Toolbar: React.FC<ToolbarProps> = ({ view, editorStateHash }) => {
  const [isRewriting, setIsRewriting] = React.useState(false);
  const [showAIDropdown, setShowAIDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAIDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!view)
    return (
      <div className="h-12 border-b border-gray-200 bg-gray-50 animate-pulse" />
    );

  const { state, dispatch } = view;
  const selectionInfo = getSelectionInfo(state);
  const canUndo = undo(state);

  // Handlers
  const handleToggleH1 = () => {
    toggleH1(state, dispatch);
    view.focus();
  };

  const handleToggleH2 = () => {
    toggleH2(state, dispatch);
    view.focus();
  };

  const handleToggleP = () => {
    toggleParagraph(state, dispatch);
    view.focus();
  };

  const handleToggleComment = () => {
    toggleComment(state, dispatch);
    view.focus();
  };

  const handleToggleBold = () => {
    toggleBold(state, dispatch);
    view.focus();
  };

  const handleToggleItalic = () => {
    toggleItalic(state, dispatch);
    view.focus();
  };

  const handleToggleUnderline = () => {
    toggleUnderline(state, dispatch);
    view.focus();
  };

  const handleToggleLink = () => {
    const isActive = markActive(state, "link");
    if (isActive) {
      toggleLink(null)(state, dispatch);
      view.focus();
      return;
    }
    const href = window.prompt("Enter URL", "https://");
    if (!href) return;
    toggleLink(href)(state, dispatch);
    view.focus();
  };

  const handleUndo = () => {
    undo(state, dispatch);
    view.focus();
  };

  const handleRewrite = async (intent: RewriteIntent) => {
    if (!selectionInfo.isValid) {
      console.warn("Invalid selection detected by UI handler");
      return;
    }

    setIsRewriting(true);
    setShowAIDropdown(false);
    await performRewrite(view, intent);
    setIsRewriting(false);
  };

  // Check active states for styles
  // Ideally use a helper to check active marks/nodes
  const boldActive = markActive(state, "strong");
  const italicActive = markActive(state, "em");
  const underlineActive = markActive(state, "underline");
  const linkActive = markActive(state, "link");

  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
        <ToolbarButton
          onClick={handleToggleP}
          icon={<Type size={18} />}
          label="Text"
          title="Normal Text"
        />
        <ToolbarButton
          onClick={handleToggleH1}
          icon={<Heading1 size={18} />}
          label="H1"
          title="Heading 1"
        />
        <ToolbarButton
          onClick={handleToggleH2}
          icon={<Heading2 size={18} />}
          label="H2"
          title="Heading 2"
        />
      </div>

      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
        <ToolbarButton
          onClick={handleToggleBold}
          icon={<Bold size={18} />}
          label="Bold"
          title="Bold"
          active={boldActive}
        />
        <ToolbarButton
          onClick={handleToggleItalic}
          icon={<Italic size={18} />}
          label="Italic"
          title="Italic"
          active={italicActive}
        />
        <ToolbarButton
          onClick={handleToggleUnderline}
          icon={<Underline size={18} />}
          label="Underline"
          title="Underline"
          active={underlineActive}
        />
        <ToolbarButton
          onClick={handleToggleLink}
          icon={<Link2 size={18} />}
          label="Link"
          title="Add/Remove Link"
          active={linkActive}
        />
      </div>

      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
        <ToolbarButton
          onClick={handleToggleComment}
          icon={<MessageSquarePlus size={18} />}
          label="Comment"
          title="Add Comment Mark"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={handleUndo}
          disabled={!canUndo || isRewriting}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors mr-2",
            "border",
            !canUndo || isRewriting
              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          )}
          title="Undo last change"
        >
          <RotateCcw size={16} />
          Undo
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowAIDropdown(!showAIDropdown)}
            disabled={!selectionInfo.isValid || isRewriting}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              "border",
              !selectionInfo.isValid || isRewriting
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            )}
            title={
              !selectionInfo.isValid ? selectionInfo.reason : "Rewrite with AI"
            }
          >
            {isRewriting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            AI Clarify
            {!isRewriting && <ChevronDown size={16} />}
          </button>

          {showAIDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
              <button
                onClick={() => handleRewrite(RewriteIntent.CLARIFY)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 first:rounded-t-md transition-colors"
              >
                <span className="font-medium">Clarify</span>
                <p className="text-xs text-gray-500">
                  Make text clearer and easier to understand
                </p>
              </button>
              <button
                onClick={() => handleRewrite(RewriteIntent.SHORTEN)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <span className="font-medium">Shorten</span>
                <p className="text-xs text-gray-500">Make text more concise</p>
              </button>
              <button
                onClick={() => handleRewrite(RewriteIntent.FORMALIZE)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 last:rounded-b-md transition-colors"
              >
                <span className="font-medium">Formalize</span>
                <p className="text-xs text-gray-500">
                  Use more formal language
                </p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  title?: string;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  icon,
  label,
  title,
  active,
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={clsx(
        "p-2 rounded-md transition-colors",
        active
          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
      type="button"
    >
      {icon}
    </button>
  );
};
