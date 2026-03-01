import { CloseButton } from "./CloseButton";
import { sizeClasses, typeColors, typeIcons } from "./modalConfig";
import { useModalKeyboard } from "./useModalKeyboard";
import type { ModalProps } from "./types";

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  type = "default",
  glassmorphic = false,
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}) => {
  useModalKeyboard(isOpen, onClose);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 animate-fade-in"
        onClick={handleOverlayClick}
      />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`
            relative w-full ${sizeClasses[size]}
            ${glassmorphic ? "glass shadow-2xl" : "bg-white shadow-xl"}
            rounded-xl ${typeColors[type]} transform transition-all duration-300 animate-scale-up
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div
              className={`flex items-center gap-3 p-6 ${footer ? `border-b ${glassmorphic ? "border-white/20" : "border-gray-200"}` : ""}`}
            >
              {typeIcons[type] && (
                <div className="shrink-0">{typeIcons[type]}</div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 flex-1">
                {title}
              </h3>
              {showCloseButton && (
                <CloseButton onClose={onClose} withTitle={true} />
              )}
            </div>
          )}
          {!title && showCloseButton && (
            <CloseButton onClose={onClose} withTitle={false} />
          )}
          <div
            className={`p-6 ${!title && "pt-12"} max-h-[calc(100vh-200px)] overflow-y-auto`}
          >
            {children}
          </div>
          {footer && (
            <div
              className={`flex items-center justify-end gap-3 p-6 border-t ${glassmorphic ? "border-white/20" : "border-gray-200"}`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
